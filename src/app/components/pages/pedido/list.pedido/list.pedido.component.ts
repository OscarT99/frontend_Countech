import { Component, OnInit, ViewChild } from '@angular/core';
import { FilterMetadata } from 'primeng/api';
import { Table } from 'primeng/table';
import { PedidoService } from 'src/app/services/pedido/pedido.service';
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';

import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import * as XLSX from 'xlsx';



@Component({
    templateUrl: './list.pedido.component.html',

})
export class ListPedidoComponent implements OnInit {
    mostrarPedidosActivos: boolean = true;

    listPedidos: PedidoInstance[] = []
    pedido: PedidoInstance = {}
    id: number = 0;

    mostrarModalDetalle: boolean = false;
    pedidoIdSeleccionado!: number;
    detallePedido: any; 

    rowsPerPageOptions = [5, 10, 15];

    motivoAnulacion: string = '';
    showConfirmationDialogPedido: boolean = false;
    pedidoSeleccionado: PedidoInstance | null = null;

    constructor(
        private _pedidoService: PedidoService,
        private router: Router,
        private toastr: ToastrService,
        private confirmationService: ConfirmationService,               
    ) { }

    ngOnInit(): void {
        this.getListPedidos()
    }

    getListPedidos() {
        this._pedidoService.getListPedidos().subscribe((data: any) => {
            this.listPedidos = data.listaPedidos.filter((pedido: any) => {
                return pedido.estado === 'Registrado' || pedido.estado === 'En proceso';
            });
        });
    }

    async mostrarDetallePedido(id: number) {
        try {
            this.detallePedido = await this._pedidoService.getPedido(id).toPromise();
            console.log('Detalle del pedido:', this.detallePedido);
            this.mostrarModalDetalle = true;
        } catch (error) {
            console.error('Error al obtener el detalle del pedido:', error);
        }
    }

    editarPedido(id: number): void {
        this.router.navigate(['/pages/pedido/add', id]);
    }

    anularPedido(pedido:PedidoInstance):void{
        this.pedidoSeleccionado = pedido;
        this.showConfirmationDialogPedido = true;
    }

    confirmActionCompra(confirm: boolean): void {
        if (confirm && this.pedidoSeleccionado) {
            if (this.motivoAnulacion.trim() === '') {
                this.toastr.warning('Ingrese un motivo de anulación.', 'Motivo Requerido');
                return;
            }
    
            const id = this.pedidoSeleccionado.id ?? 0;
            this._pedidoService.anularPedido(id, false, this.motivoAnulacion).subscribe(
                (response) => {
                    this.toastr.success('El pedido se anuló correctamente.', 'pedido Anulado');
                    this.getListPedidos();
                },
                (error) => {
                    console.error('Error al anular el pedido:', error);
                }
            );
        }
    
        this.showConfirmationDialogPedido = false;
        this.pedidoSeleccionado = null;
        this.motivoAnulacion = ''; // Restablecer el motivo de anulación
    }

    alternarVistaEstado() {
        this.mostrarPedidosActivos = !this.mostrarPedidosActivos;
    }

    ffiltroEstado(pedido: any, filtros: { [s: string]: any }): boolean {
        const estadoPedido = pedido.estadoPedido;
    
        return (this.mostrarPedidosActivos && estadoPedido === true && (!filtros['estado'] || filtros['estado'].value === 'true')) ||
               (!this.mostrarPedidosActivos && estadoPedido === false && (!filtros['estado'] || filtros['estado'].value === 'false'));
    }
    
    exportToExcel(){
        const data: any[] = []

        const headers = [
            'Cliente',
            'Orden Trabajo',
            'Fecha Orden',
            'Fecha Entrega',
            'Referencia',
            'Descripción',
            'Valor Unitario',
            'Cantidad Total',
            'Forma Pago',
            'Valor Total'
        ];

        data.push(headers)

        this.listPedidos.forEach(pedido => {
            if(pedido.estadoPedido == true){
                const row = [
                    pedido.cliente,
                    pedido.ordenTrabajo,
                    pedido.fechaOrdenTrabajo,
                    pedido.fechaEntregaOrden,
                    pedido.referencia,
                    pedido.descripcion,
                    { t: 'n', v: pedido.valorUnitario },
                    {t:'n',v: pedido.cantidadTotal},
                    pedido.formaPago,
                    { t: 'n', v: pedido.valorTotal }
                ];

                data.push(row)
            };        
        });

        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb,ws,'Pedidos');

        XLSX.writeFile(wb,'pedidos.xlsx')
    }
 
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
      }

      getSeverity(estado: string, estadoPedido: boolean): string {
        if (estadoPedido === false && estado === 'Registrado') {
            return 'danger';
        }
    
        switch (estado) {
            case 'Registrado':
                return 'success';
            case 'En proceso':
                return 'warning';
            case 'Terminado':
                return 'success';
            default:
                return 'info'; // Puedes cambiar 'info' según tus necesidades
        }
    }

    getDisplayedEstado(estado: string, estadoPedido: boolean): string {
        if (estadoPedido === false) {
            return 'Anulado';
        } else {
            return estado;
        }
    }

}
