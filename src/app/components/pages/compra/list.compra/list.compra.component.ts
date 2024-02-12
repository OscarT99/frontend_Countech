import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CompraService } from 'src/app/services/compra/compra.service'; 
import { CompraInstance } from 'src/app/interfaces/compra/compra.interface'; 
import { InsumoService } from 'src/app/services/insumo/insumo.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import * as XLSX from 'xlsx';


@Component({
    templateUrl: './list.compra.component.html',
    
})
export class ListCompraComponent implements OnInit {
    mostrarComprasActivas: boolean = true;

    motivoAnulacion: string = '';
    showConfirmationDialogCompra: boolean = false;
    compraSeleccionada: CompraInstance | null = null;

    listCompras: CompraInstance[] = []
    compra: CompraInstance = {}
    id:number=0;

    mostrarModalDetalle: boolean = false;
    detalleCompra: any; // Puedes ajustar esto según la estructura de tu pedido
   
    rowsPerPageOptions = [5, 10, 15];


    constructor(
      private _compraService:CompraService,
      private _insumoService:InsumoService,
      private toastr: ToastrService,      
      ){}

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
        this.compraSeleccionada = compra;
        this.showConfirmationDialogCompra = true;
    }

    confirmActionCompra(confirm: boolean): void {
        if (confirm && this.compraSeleccionada) {
            if (this.motivoAnulacion.trim() === '') {
                this.toastr.warning('Ingrese un motivo de anulación.', 'Motivo Requerido');
                return;
            }
    
            const id = this.compraSeleccionada.id ?? 0;
    
            // Llamar al servicio de anulación de compra
            this._compraService.anularCompra(id, false, this.motivoAnulacion).subscribe(
                (anularResponse) => {
                    this.toastr.success('La compra se anuló correctamente.', 'Compra Anulada');
                    this.getListCompras();
                       
                    if (this.compraSeleccionada!.DetalleEnCompras) {
                        // Obtener la cantidad de cada detalle
                        const cantidades = this.compraSeleccionada!.DetalleEnCompras.map(detalle => detalle?.cantidad);
    
                        // Llamar al servicio para restar cantidad de insumo para cada detalle
                        for (const cantidad of cantidades) {
                            if (cantidad !== undefined) {
                                this._insumoService.restarCantidadInsumoCompra(id, cantidad).subscribe(
                                    (restarCantidadResponse) => {
                                        // Manejar la respuesta del servicio para restar cantidad de insumo
                                        // Puedes realizar alguna lógica adicional si es necesario
                                    },
                                    (restarCantidadError) => {
                                        console.error('Error al restar la cantidad del insumo:', restarCantidadError);
                                        // Puedes manejar el error aquí si es necesario
                                    }
                                );
                            }
                        }
                    }
    
                    this.toastr.success('La compra se anuló correctamente y se restó la cantidad de insumo.', 'Compra Anulada');
                    this.getListCompras();
                },
                (anularError) => {
                    console.error('Error al anular la compra:', anularError);
                    // Puedes manejar el error aquí si es necesario
                }
            );
        }
    
        this.showConfirmationDialogCompra = false;
        this.compraSeleccionada = null;
        this.motivoAnulacion = ''; // Restablecer el motivo de anulación
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
