import {Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



import { v4 as uuidv4 } from 'uuid';

import { CompraService } from 'src/app/services/compra/compra.service'; 
import { CompraInstance } from 'src/app/interfaces/compra/compra.interface';
import { ProveedorService } from 'src/app/services/proveedor/proveedor.service'; 
import { DetalleCompraInstance } from 'src/app/interfaces/compra/detalleCompra.interface';
import { Proveedor } from 'src/app/interfaces/proveedor/proveedor.interface';
import { InsumoService } from 'src/app/services/insumo/insumo.service';
import { InsumoInstance } from 'src/app/interfaces/insumo/insumo.interface';

@Component({
  templateUrl: './add.compra.component.html',
})
export class AddCompraComponent implements OnInit {

  maxDate: Date = new Date();

  mostrarID:boolean=false;
  
  proveedores: Proveedor[] = [];
  sugerenciasProveedores: Proveedor[] = [];
  insumos:InsumoInstance[]=[]
  sugerenciasInsumos:InsumoInstance[]=[];
  campoBusqueda: string = '';

  formCompra:FormGroup;
  detallesInsumo: DetalleCompraInstance[] = [];
  @ViewChild('insumoInput') insumoInput: ElementRef | undefined;

  formaPago: SelectItem[] = [
    { label: 'Crédito', value: 'Crédito' },
    { label: 'Contado', value: 'Contado' }
  ];

  impuestos: { label: string, value: number }[] = [
    { label: '', value: 0 }, 
    { label: '19%', value: 0.19 },
    { label: '5%', value: 0.05 }
    ];
    
    constructor(
    private fb: FormBuilder,    
    private _compraService: CompraService,        
    private toastr: ToastrService,
    private _proveedorService: ProveedorService,
    private _insumoService: InsumoService,    
    private router : Router,
    private confirmationService: ConfirmationService,    
  ) {
    this.formCompra=this.fb.group({
        proveedor:['',Validators.required],
        razonSocial:[],
        numeroFactura:['',Validators.required],
        fechaCompra:['',Validators.required],
        contacto:[{ value: '', disabled: true}],
        insumo:['',Validators.required],
        insumoNombre:[],
        cantidad:[0,Validators.required],
        valorUnitario:[0,Validators.required],
        ivaInsumo:['',Validators.required],
        formaPago:['',Validators.required],
        totalBruto:[0],
        ivaTotal:[0],
        totalNeto:[0],
        observaciones:[''],
        idTemporal:[null]
    })
  }

  ngOnInit(): void {
    this.obtenerListaInsumos()    
    this.obtenerListaProveedores()    
  }
      

  /////   METODOS PARA ESCOGER EL PROVEEDOR
  obtenerListaProveedores(): void {
    this._proveedorService.getListProveedoresCompra().subscribe(
      (data: { listProveedores: Proveedor[] }) => {
        this.sugerenciasProveedores = data.listProveedores.filter(proveedor => proveedor.estado);
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  buscarProveedores(event: any): void {
    if(!event.query){
      this.obtenerListaProveedores();
    }
    this.sugerenciasProveedores = this.filterProveedores(event.query);
  }
  
  filterProveedores(query: string): Proveedor[] {
    return this.sugerenciasProveedores.filter(
      (proveedor) =>
        proveedor.razonSocial!.toLowerCase().includes(query.toLowerCase()) ||
        proveedor.nombreComercial!.toLowerCase().includes(query.toLowerCase()) ||
        proveedor.numeroIdentificacion!.toLowerCase().includes(query.toLowerCase())
    );
  }

  seleccionarProveedor(event: any): void {
    const proveedorId = event.value.id;
    const proveedorRazonSocial = event.value.razonSocial; 

    this.formCompra.get('proveedor')!.setValue(proveedorId);
    this.formCompra.get('razonSocial')!.setValue(proveedorRazonSocial);
  
    const proveedorSeleccionado = this.sugerenciasProveedores.find(c => c.id === proveedorId);
  
    if (proveedorSeleccionado) {
      this.formCompra.get('contacto')!.setValue(proveedorSeleccionado.contacto || '');
    }
  }

  realizarBusquedaEnTiempoReal(event: any): void {
    const query = event.target.value;
    this.obtenerListaProveedores(); // Obtener la lista completa de clientes
    this.sugerenciasProveedores = this.filterProveedores(query);
}

  /////   METODOS PARA ESCOGER EL INSUMO
  obtenerListaInsumos(): void {
    this._insumoService.getListInsumosCompra().subscribe(
      (data: { listInsumos: InsumoInstance[] }) => {
        this.sugerenciasInsumos = data.listInsumos.filter(insumo => insumo.estado);;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  buscarInsumos(event: any): void {
    if(!event.query){
      this.obtenerListaInsumos();
    }
    this.sugerenciasInsumos = this.filterInsumos(event.query);
  }
  
  filterInsumos(query: string): InsumoInstance[] {
    return this.sugerenciasInsumos.filter(
      (insumo) =>
        insumo.nombre!.toLowerCase().includes(query.toLowerCase()) 
    );
  }

  seleccionarInsumo(event: any): void {
    const insumoId = event.value.id;
    const insumoNombre = event.value.nombre

    this.formCompra.get('insumo')!.setValue(insumoId);
    this.formCompra.get('insumoNombre')!.setValue(insumoNombre);
  }

  realizarBusquedaEnTiempoRealInsumo(event: any): void {
    const query = event.target.value;
    this.obtenerListaInsumos(); // Obtener la lista completa de clientes
    this.sugerenciasInsumos = this.filterInsumos(query);
}

  /////   METODOS PARA CREAR,MODIFICAR,ELIMINAR DETALLE INSUMO
  agregarInsumo(): void {

    if(this.formCompra.value.idTemporal == null){

      const insumo = this.formCompra.value.insumo;
      const cantidad = this.formCompra.value.cantidad;
      const valorUnitario = this.formCompra.value.valorUnitario;
      const impuestoIva = this.formCompra.value.ivaInsumo.value;
      const valorIva = valorUnitario * impuestoIva;
    
      if (!insumo || !cantidad || !valorUnitario) {
        this.toastr.warning('Complete los campos requeridos.');
        return;
      }
    
      const detalleExistente = this.detallesInsumo.find(
        detalle =>
          detalle.insumo === insumo && detalle.valorUnitario === valorUnitario
      );
    
      if (detalleExistente) {
        detalleExistente.cantidad += cantidad;
        detalleExistente.valorTotal = detalleExistente.cantidad! * (valorUnitario + valorIva);
      } else {
        const nuevoInsumoInstance: DetalleCompraInstance = {
          id: uuidv4(),
          insumo: insumo,
          cantidad: cantidad,
          valorUnitario: valorUnitario,
          impuestoIva: valorIva,
          valorTotal: cantidad * (valorUnitario + valorIva)
        };
        this.detallesInsumo.push(nuevoInsumoInstance);
      }
  
      this.calcularTotales();
  
      this.formCompra.patchValue({
        insumo: '',
        cantidad: 0,
        valorUnitario: 0,
        ivaInsumo: '',
        idTemporal: null
      });
  
      setTimeout(() => {
        if (this.insumoInput) {
          this.insumoInput.nativeElement.focus();
        }
      });

      this.formCompra.get('insumo')!.setErrors(null);

    } else {
      const index = this.detallesInsumo.findIndex(
        detalle => detalle.id === this.formCompra.value.idTemporal
      );
  
      if (index !== -1) {
        const detalleExistente = this.detallesInsumo[index];
  
        detalleExistente.insumo = this.formCompra.value.insumo;
        detalleExistente.cantidad = this.formCompra.value.cantidad;
        detalleExistente.valorUnitario = this.formCompra.value.valorUnitario;
        detalleExistente.impuestoIva = (this.formCompra.value.ivaInsumo.value * this.formCompra.value.valorUnitario);
  
        detalleExistente.valorTotal = detalleExistente.cantidad! *
        (detalleExistente.valorUnitario! + detalleExistente.impuestoIva!);
  
        this.calcularTotales();
  
        this.formCompra.patchValue({
          insumo: '',
          cantidad: 0,
          valorUnitario: 0,
          ivaInsumo: '',
          idTemporal: null  
        });
  
        setTimeout(() => {
          if (this.insumoInput) {
            this.insumoInput.nativeElement.focus();
          }
        });

        this.formCompra.get('insumo')!.setErrors(null);

      } else {
        console.error('No se encontró el detalle en la lista.');
      }
    }    
  }
  
  getInsumoModificar(detalleCompra:DetalleCompraInstance){
    this.formCompra.patchValue({      
      insumo:detalleCompra.insumo,
      cantidad:detalleCompra.cantidad,
      valorUnitario:detalleCompra.valorUnitario,
      ivaInsumo:detalleCompra.impuestoIva,
      idTemporal:detalleCompra.id,
    });
     
    setTimeout(() => {
      if (this.insumoInput) {
        this.insumoInput.nativeElement.focus();
      }
    });

  }
  
  eliminarInsumo(insumo: DetalleCompraInstance): void {

    if(this.detallesInsumo.length > 1){

      const index = this.detallesInsumo.indexOf(insumo);
    
      if (index !== -1) {
        this.detallesInsumo.splice(index, 1);
        this.calcularTotales();
      } else {
        console.error("No se encontró el insumo en la lista.");
      }
    }else{
      this.toastr.warning('Debe haber al menos un detalle de insumo.');
    }

    
  }
  

  totalNeto: number = 0;
  
  ////  ACTUALIZAR VALORES DE TOTALBRUTO, IVATOTAL, TOTALNETO
  calcularTotales(): void {
    let totalBruto = 0;
    let ivaTotal = 0;
    this.detallesInsumo.forEach(detalle => {
      totalBruto += detalle.cantidad! * detalle.valorUnitario!;
      ivaTotal += detalle.cantidad! * detalle.impuestoIva!;
    });
    this.totalNeto = totalBruto + ivaTotal; // Asignar valor a totalNeto

    this.formCompra.get('totalBruto')!.setValue(totalBruto)
    this.formCompra.get('ivaTotal')!.setValue(ivaTotal)
    this.formCompra.get('totalNeto')!.setValue(this.totalNeto)        
  }


  /////   METODO  PARA AGREGAR LA COMPRA A LA BASE DE DATOS
  addCompra(){

    this.formCompra.markAllAsTouched();
    
    if(this.formCompra.valid){
      const compra : CompraInstance = {
        proveedor:this.formCompra.value.proveedor,
        fechaCompra:this.formCompra.value.fechaCompra,
        numeroFactura:this.formCompra.value.numeroFactura,
        formaPago:this.formCompra.value.formaPago,
        totalBruto:this.formCompra.value.totalBruto,
        iva:this.formCompra.value.ivaTotal,
        totalNeto:this.formCompra.value.totalNeto,
        DetalleEnCompras:this.detallesInsumo,
        observaciones:this.formCompra.value.observaciones
      }
        
        this._compraService.postCompra(compra).subscribe(()=>{        
          this.router.navigate(['/pages/compra']);        
          this.toastr.success(`La compra ${compra.numeroFactura} fue registrada con exito`,`Compra agregada`)
          this.detallesInsumo.forEach(detalle => {
            this._insumoService.sumarCantidadInsumo(detalle.insumo!, detalle.cantidad!)
              .subscribe();
          });
        })    
    }else{
      this.toastr.error('Por favor, complete todos los campos obligatorios.', 'Error de validación');
    }    
  }
    

  
  mostrarConfirmacionSalir() {
    this.confirmationService.confirm({
      icon: 'pi pi-exclamation-triangle', 
      header: '¿Deseas salir de la creación?',
      message: 'Con esta acción perderás todos los cambios que no hayas guardado y no los podrás recuperar.',
      acceptLabel: 'Salir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.router.navigate(['/pages/compra']);
      },
      reject: () => {
        // El usuario ha cancelado la acción, no hacer nada
      }
    });
  }
  

  
}
