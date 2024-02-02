import {Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
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
    
    constructor(private fb: FormBuilder,
    private _compraService: CompraService,
    private toastr: ToastrService,
    private _proveedorService: ProveedorService,
    private _insumoService: InsumoService,
    private router : Router,
  ) {
    this.formCompra=this.fb.group({
        proveedor:['',Validators.required],
        numeroFactura:['',Validators.required],
        fechaCompra:['',Validators.required],
        contacto:[{ value: '', disabled: true}],
        insumo:['',Validators.required],
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
        this.sugerenciasProveedores = data.listProveedores;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  buscarProveedores(event: any): void {
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
    this.formCompra.get('proveedor')!.setValue(proveedorId);
  
    const proveedorSeleccionado = this.sugerenciasProveedores.find(c => c.id === proveedorId);
  
    if (proveedorSeleccionado) {
      this.formCompra.get('contacto')!.setValue(proveedorSeleccionado.contacto || '');
    }
  }



  /////   METODOS PARA ESCOGER EL INSUMO
  obtenerListaInsumos(): void {
    this._insumoService.getListInsumosCompra().subscribe(
      (data: { listInsumos: InsumoInstance[] }) => {
        this.sugerenciasInsumos = data.listInsumos;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  buscarInsumos(event: any): void {
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
    this.formCompra.get('insumo')!.setValue(insumoId);
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
  


  ////  ACTUALIZAR VALORES DE TOTALBRUTO, IVATOTAL, TOTALNETO
  calcularTotales(): void {
    let totalBruto = 0;
    let ivaTotal = 0;
    let totalNeto = 0;
  
    this.detallesInsumo.forEach(detalle => {
      totalBruto += detalle.cantidad! * detalle.valorUnitario!;
      ivaTotal += detalle.cantidad! * detalle.impuestoIva!;
    });
  
    totalNeto = totalBruto + ivaTotal;
  
    this.formCompra.get('totalBruto')!.setValue(totalBruto)
    this.formCompra.get('ivaTotal')!.setValue(ivaTotal)
    this.formCompra.get('totalNeto')!.setValue(totalNeto)        
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
      
}
