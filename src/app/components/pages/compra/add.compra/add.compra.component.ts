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
  
  id: number = 0;
  proveedores: Proveedor[] = [];
  sugerenciasProveedores: Proveedor[] = [];
  insumos:InsumoInstance[]=[]
  sugerenciasInsumos:InsumoInstance[]=[];
  campoBusqueda: string = '';

  insumoEditandoIndex: number | null = null;

  formaPago: SelectItem[] = [
    { label: 'Crédito', value: 'Crédito' },
    { label: 'Contado', value: 'Contado' }
  ];

  formCompra:FormGroup;
  detallesInsumo: DetalleCompraInstance[] = [];

  impuestos: { label: string, value: number }[] = [
    { label: '', value: 0 }, 
    { label: '19%', value: 0.19 },
    { label: '5%', value: 0.05 }
    ];
    
    constructor(private fb: FormBuilder,
    private _compraService: CompraService,
    private toastr: ToastrService,
    private aRouter: ActivatedRoute,
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
        totalBruto:['',Validators.required],
        ivaTotal:['',Validators.required],
        totalNeto:['',Validators.required],
        observaciones:[''],
        idTemporal:[null]
    })
  }

  ngOnInit(): void {
    this.aRouter.params.subscribe(params => {
      this.id = +params['id'];

      if (this.id !== 0) {
        this.getCompra(this.id)
        this.obtenerListaInsumos()  
        this.obtenerListaProveedores()
                        
      } else {
        this.obtenerListaInsumos()    
        this.obtenerListaProveedores()    
      }
    });
  }

  getInsumoModificar(detalleCompra:DetalleCompraInstance){
    this.formCompra.patchValue({      
      insumo:detalleCompra.insumo,
      cantidad:detalleCompra.cantidad,
      valorUnitario:detalleCompra.valorUnitario,
      ivaInsumo:detalleCompra.impuestoIva,
      idTemporal:detalleCompra.id,
    })
  }

  getCompra(id:number){
    this._compraService.getCompra(id).subscribe((data:CompraInstance) => {        
      console.log(data)
      this.formCompra.patchValue({
        proveedor:data.proveedor,
        numeroFactura:data.numeroFactura,
        fechaCompra:data.fechaCompra,
        formaPago:data.formaPago,
        totalBruto:data.totalBruto,
        ivaTotal:data.iva,
        totalNeto:data.totalNeto,        
      })

      this.detallesInsumo = data.DetalleEnCompras || []
      console.log(this.detallesInsumo)            
    })
  }
         
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
    
      // Verificar si el insumo ya existe en la lista
      const detalleExistente = this.detallesInsumo.find(
        detalle =>
          detalle.insumo === insumo && detalle.valorUnitario === valorUnitario
      );
    
      if (detalleExistente) {
        // Actualizar la cantidad del insumo existente
        detalleExistente.cantidad += cantidad;
    
        // Actualizar el valorTotal del insumo existente
        detalleExistente.valorTotal = detalleExistente.cantidad! * (valorUnitario + valorIva);
      } else {
        // Agregar un nuevo detalle si el insumo no existe con el mismo valorUnitario
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
    
      this.actualizarTotales();
    
      this.formCompra.reset({
        ...this.formCompra.value,
        insumo: '',
        cantidad: 0,
        valorUnitario: 0,
        ivaInsumo: ''
      });
    }else{
      const index = this.detallesInsumo.findIndex(
        detalle => detalle.id === this.formCompra.value.idTemporal
      );
  
      if (index !== -1) {
        // Actualizar el detalle existente con los nuevos valores
        const detalleExistente = this.detallesInsumo[index];
  
        detalleExistente.insumo = this.formCompra.value.insumo;
        detalleExistente.cantidad = this.formCompra.value.cantidad;
        detalleExistente.valorUnitario = this.formCompra.value.valorUnitario;
        detalleExistente.impuestoIva = (this.formCompra.value.ivaInsumo.value * this.formCompra.value.valorUnitario);
        

        // Actualizar el valorTotal del detalle existente
        detalleExistente.valorTotal =
          detalleExistente.cantidad! *
          (detalleExistente.valorUnitario! + detalleExistente.impuestoIva!);
  
        // Actualizar los totales
        this.actualizarTotales();
  
        // Limpiar los campos del formulario
        this.formCompra.reset({
          ...this.formCompra.value,
          insumo: '',
          cantidad: 0,
          valorUnitario: 0,
          ivaInsumo: '',
          idTemporal: null  // También puedes restablecer el idTemporal a null
        });
      } else {
        console.error('No se encontró el detalle en la lista.');
      }
    }    
  }
  
  

  eliminarInsumo(insumo: DetalleCompraInstance): void {
    const index = this.detallesInsumo.indexOf(insumo);
    
    if (index !== -1) {
      this.detallesInsumo.splice(index, 1);
      this.actualizarTotales();
    } else {
      console.error("No se encontró el insumo en la lista.");
    }
  }

  actualizarTotales(): void {
    this.formCompra.get('totalBruto')!.setValue(this.calcularTotalBruto());
    this.formCompra.get('ivaTotal')!.setValue(this.calcularIvaTotal());
    this.formCompra.get('totalNeto')!.setValue(this.calcularTotalNeto());
  }

  calcularTotalBruto(): number {
    return this.detallesInsumo.reduce((total, detalle) => total + (detalle.cantidad! * detalle.valorUnitario!), 0);
  }


  calcularIvaTotal(): number {
      return this.detallesInsumo.reduce((total, detalle) => total + (detalle.impuestoIva! * detalle.cantidad!), 0);
  }

  calcularTotalNeto(): number {
      const totalBruto = this.formCompra.value.totalBruto;
      const ivaTotal = this.formCompra.value.ivaTotal;
      return totalBruto + ivaTotal;
  }

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

  addCompra(){
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

    if(this.id !== 0){
      compra.id = this.id
      this._compraService.putCompra(this.id,compra).subscribe(()=>{
        this.router.navigate(['/pages/compra']);
        this.toastr.info(`la compra ${compra.numeroFactura} fue actualizada con exito`,`Compra actualizado`)
      })
    }else{
      this._compraService.postCompra(compra).subscribe(()=>{        
        this.router.navigate(['/pages/compra']);        
        this.toastr.success(`La compra ${compra.numeroFactura} fue registrada con exito`,`Compra agregada`)
        this.detallesInsumo.forEach(detalle => {
          this._insumoService.sumarCantidadInsumo(detalle.insumo!, detalle.cantidad!)
            .subscribe();
        });
      })
    }
  }
   
}
