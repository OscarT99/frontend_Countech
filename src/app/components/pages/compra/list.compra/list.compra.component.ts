import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CompraService } from 'src/app/services/compra/compra.service'; 
import { CompraInstance } from 'src/app/interfaces/compra/compra.interface'; 
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';


@Component({
    templateUrl: './list.compra.component.html',
    
})
export class ListCompraComponent implements OnInit {
    motivoAnulacion: string = '';
    showConfirmationDialogCompra: boolean = false;
    compraSeleccionada: CompraInstance | null = null;

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
      private toastr: ToastrService,      
      private aRouter:ActivatedRoute,
      private router : Router,
      ){}

    ngOnInit():void {        
        this.getListCompras()                                
    }

    
    getListCompras(){     
        this._compraService.getListCompras().subscribe((data:any) =>{                
          this.listCompras = data.listaCompras;          
        })        
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
        
    editarCompra(id: number): void {
        this.router.navigate(['/pages/compra/add', id]);
      }

      async mostrarDetalleCompra(id: number) {
        try {
            this.detalleCompra = await this._compraService.getCompra(id).toPromise();
            console.log('Detalle de la compra:', this.detalleCompra);
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
    
    
      
}
