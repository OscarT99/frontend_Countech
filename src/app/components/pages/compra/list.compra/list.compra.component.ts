import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CompraService } from 'src/app/services/compra/compra.service'; 
import { CompraInstance } from 'src/app/interfaces/compra/compra.interface'; 
import { InsumoService } from 'src/app/services/insumo/insumo.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';


import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbonoCompra } from 'src/app/interfaces/abonoCompra/abonoCompra.interface';
import { AbonoCompraService } from 'src/app/services/abonoCompra/abonoCompra.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';


@Component({
    templateUrl: './list.compra.component.html',
    providers: [ConfirmationService, MessageService]

    
})
export class ListCompraComponent implements OnInit {
    mostrarComprasActivas: boolean = true;
    motivoAnulacion: string = '';
    showConfirmationDialogCompra: boolean = false;
    compraSeleccionada: CompraInstance | null = null;

    listAbonoCompras: AbonoCompra [] = []
    abonoCompra: AbonoCompra = {}
    formAbonoCompra: FormGroup;

    listCompras: CompraInstance[] = []
    compra: CompraInstance = {}
    id:number=0;

    mostrarModalDetalle: boolean = false;
    compraIdSeleccionado!: number;
    detalleCompra: any; // Puedes ajustar esto según la estructura de tu pedido
    @ViewChild('detalleCompraModal') detallePedidoCompra!: Dialog;
   
    rowsPerPageOptions = [5, 10, 15];


    constructor(
      private _compraService:CompraService,
      private _abonoCompraService: AbonoCompraService,
      private _insumoService:InsumoService,
      private toastr: ToastrService,      
      private aRouter:ActivatedRoute,
      private router : Router,
      private fb: FormBuilder,
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
      ){    
        this.formAbonoCompra = this.fb.group({
            id: ['', Validators.required],
            proveedor:['',Validators.required],
            totalNeto:['',Validators.required],
            estadoPago: ['', Validators.required],
            valorRestante: [{ value: 0, disabled: true }],
        })
        this.aRouter.params.subscribe(params => {
            this.id = +params['id'];
        });
          
    }

    ngOnInit():void {        
        this.getListCompras()                                
    }

    
    getListCompras(){     
        this._compraService.getListCompras().subscribe((data:any) =>{                
          this.listCompras = data.listaCompras;          
        })        
    }

    async mostrarDetalleCompra(id: number) {
        try {
            this.detalleCompra = await this._compraService.getCompra(id).toPromise();
            this.mostrarModalDetalle = true;
        } catch (error) {
            console.error('Error al obtener el detalle de la compra:', error);
        }
    }

    anularCompra(compra: CompraInstance): void {
        // Mostrar el cuadro de diálogo de confirmación
        this.compraSeleccionada = compra;
        this.showConfirmationDialogCompra = true;
    }

    // confirmActionCompra(confirm: boolean): void {
    //     if (confirm && this.compraSeleccionada) {
    //         // Realizar la anulación de compra
    //         const id = this.compraSeleccionada.id ?? 0; // Si compraSeleccionada.id es undefined, asigna 0
    //         this._compraService.anularCompra(id, false).subscribe(
    //             (response) => {
    //                 this.toastr.success('La compra se anuló correctamente.', 'Compra Anulada');
    //                 this.getListCompras();
    //             },
    //             (error) => {
    //                 console.error('Error al anular la compra:', error);
    //             }
    //         );
    //     }
    
    //     this.showConfirmationDialogCompra = false;
    //     this.compraSeleccionada = null;
    // }

    confirmActionCompra(confirm: boolean): void {
        if (confirm && this.compraSeleccionada) {
            if (this.motivoAnulacion.trim() === '') {
                this.toastr.warning('Ingrese un motivo de anulación.', 'Motivo Requerido');
                return;
            }
    
            const id = this.compraSeleccionada.id ?? 0;
            this._compraService.anularCompra(id, false, this.motivoAnulacion).subscribe(
                (response) => {
                    this.toastr.success('La compra se anuló correctamente.', 'Compra Anulada');
                    this.getListCompras();
                },
                (error) => {
                    console.error('Error al anular la compra:', error);
                }
            );
        }
    
        this.showConfirmationDialogCompra = false;
        this.compraSeleccionada = null;
        this.motivoAnulacion = ''; // Restablecer el motivo de anulación
    }
    
    
    //Abono Compras
    value8: any;
    value9: any;
    productDialogAbono: boolean = false;



    

    getCompra(id:number){
        this._compraService.getCompra(id).subscribe((data:CompraInstance) => {        
          console.log(data)
          this.formAbonoCompra=this.fb.group({
            id: ['', Validators.required],
            proveedor:['',Validators.required],
            numeroFactura:['',Validators.required],
            fechaCompra:['',Validators.required],
            formaPago:['',Validators.required],
            totalBruto:['',Validators.required],
            ivaTotal:['',Validators.required],
            totalNeto:['',Validators.required],
            estadoPago: ['', Validators.required],
            valorRestante: [{ value: 0, disabled: true }],


        })

          this.formAbonoCompra.patchValue({
            id: data.id,
            proveedor:data.proveedor,
            numeroFactura:data.numeroFactura,
            fechaCompra:data.fechaCompra,
            formaPago:data.formaPago,
            totalBruto:data.totalBruto,
            ivaTotal:data.iva,
            totalNeto:data.totalNeto, 
            estadoPago: data.estadoPago,       
          })
    
           
        })
    }



  

    newAbonoCompra(id: number) {
        this.id = id;
        this.productDialogAbono = true;
        this.getCompra(id);
        
        // Filtra los abonos por la compra seleccionada
        this.filtrarAbonosPorCompra(id);
        this.getListAbonoCompras();
    }


    


    openNew() {
        this.id = 0;                
        this.formAbonoCompra.reset()
        this.productDialogAbono = true;
    }



    

    
    
    confirm2(event: Event) {
        this.confirmationService.confirm({
        key: 'confirm2',
        target: event.target || new EventTarget,
        message: '¿Está seguro de realizar el abono?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí', 
        accept: () => {
            this.agregarAbonoCompra(this.value9);
            console.log(this.getValorRestante());
            const valorRestante = this.getValorRestante();
            this.value9 = undefined; 
            this.formAbonoCompra.get('valorRestante')?.setValue(valorRestante);
    
    
            
        },
        reject: () => {
            this.messageService.add({
            severity: 'error',
            summary: 'Cancelado',
            detail: 'El abono no fue agregado a la compra'
            });
        }
        });
    }


    agregarAbonoCompra(valorAbono: number) {
        const nuevoAbono: AbonoCompra = {
        valorAbono: valorAbono,
        fechaAbono: new Date(),
        compra: this.id
            };
        // Verificar si el valor restante es 0 antes de agregar un nuevo abono
        const valorRestante = this.getValorRestante();
    
        if (valorRestante > 0) {
        // Verificar si el valorAbono es mayor al valorRestante
        if (valorAbono > valorRestante) {
            this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'El valor del abono no puede ser mayor al valor restante'
            });
        } else {
            this._abonoCompraService.postAbonoCompra(nuevoAbono).subscribe(
            () => {
                this.messageService.add({
                severity: 'success',
                summary: 'Agregado',
                detail: 'El abono se agregó exitosamente a la compra'
                });
                this.getListAbonoCompras(); // Actualiza la lista de abonos de compra después de agregar uno nuevo
                //this.hideDialog(); // Cierra el diálogo después de agregar el abono de compra
            },
            (error) => {
                console.error('Error al agregar abono de compra:', error);
                this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al agregar el abono a la compra'
                });
            }
            );
        }
        } else {
        // Mostrar un mensaje o deshabilitar el botón de agregar abono si el valor restante es 0
        this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No se pueden agregar más abonos, el valor restante es 0'
        });
        }
    }
  

    //filtrar abonos de la compra seleccionada
    filtrarAbonosPorCompra(compraId: number) {
        this.listAbonoCompras = this.listAbonoCompras.filter(abono => abono.compra === compraId);
    }


    //Listar Abonos
    getListAbonoCompras() {
        if (this.id !== 0) {
        this._abonoCompraService.getListAbonoCompras().subscribe((data: any) => {
            this.listAbonoCompras = data.listAbonoCompras.filter((abono: AbonoCompra) => abono.compra === this.id);
        });
        }
    }
  



    
    
    getValorRestante(): number {
        if (
          this.compra &&
          this.compra.totalNeto !== undefined &&
          this.listAbonoCompras &&
          this.listAbonoCompras.length > 0
        ) {
          const abonosRelacionados = this.listAbonoCompras.filter(abono => abono.compra === this.id);
      
          if (abonosRelacionados.length > 0 && !isNaN(parseFloat(this.compra.totalNeto.toString()))) {
            let totalAbonos = 0;
      
            abonosRelacionados.forEach(abono => {
              if (abono.valorAbono !== undefined) {
                const valorAbono = parseFloat(abono.valorAbono.toString());
                if (!isNaN(valorAbono)) {
                  totalAbonos += valorAbono;
                }
              }
            });
      
            const totalNeto = parseFloat(this.compra.totalNeto.toString());
            const valorRestante = totalNeto - totalAbonos;
            return valorRestante;
          }
        }
      
        // Si no hay abonos relacionados o si falta información, devuelve el total neto de la compra o 0 si no está definido
        return this.compra && this.compra.totalNeto !== undefined ? parseFloat(this.compra.totalNeto.toString()) : 0;
    }
    
    
      
    alternarVistaEstadoCompra() {
        this.mostrarComprasActivas = !this.mostrarComprasActivas;
      }
      
      ffiltroEstadoCompra(compra: any, filtros: { [s: string]: any }): boolean {
          return (this.mostrarComprasActivas && compra.estadoCompra === true && (!filtros['estadoCompra'] || filtros['estadoCompra'].value === 'true')) ||
                 (!this.mostrarComprasActivas && compra.estadoCompra === false && (!filtros['estadoCompra'] || filtros['estadoCompra'].value === 'false'));
      }

      exportToExcel(){
        const data: any[] = [];

        const headers = [
            'Proveedor',
            'N° Factura',
            'Fecha Compra',
            'Forma pago',
            'Total Bruto',
            'Iva',
            'Total Neto'
        ];

        data.push(headers);

        
        this.listCompras.forEach(compra => {
            if(compra.estadoCompra == true){
                const row = [
                    compra.proveedor,
                    compra.numeroFactura,
                    compra.fechaCompra,
                    compra.formaPago,
                    {t:'n',v: compra.totalBruto},
                    {t:'n',v: compra.iva},
                    {t:'n',v: compra.totalNeto}
                ];

                data.push(row);
            };                                    
        });

        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb,ws,'Compras');

        XLSX.writeFile(wb,'compras.xlsx')
      }

      onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
      }

      getEstadoLabel(estadoCompra: boolean): string {
        return estadoCompra ? 'Activa' : 'Anulada';
    }
    
    getSeverityCompra(estadoCompra: boolean): string {
        return estadoCompra ? 'success' : 'danger';
    }
    
    
}
