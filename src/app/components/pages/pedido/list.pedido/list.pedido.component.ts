import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { PedidoService } from 'src/app/services/pedido/pedido.service';
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



@Component({
    templateUrl: './list.pedido.component.html',

})
export class ListPedidoComponent implements OnInit {

    formMotivoAnulacionPedido: FormGroup;
    mostrarPedidosActivos: boolean = true;

    listPedidosActivos: PedidoInstance[] = []
    listPedidosAnulados: PedidoInstance[] = []


    pedido: PedidoInstance = {}
    id: number = 0;

    mostrarModalDetalle: boolean = false;
    pedidoIdSeleccionado!: number;
    detallePedido: any;

    rowsPerPageOptions = [5, 10, 15];

    showConfirmationDialogPedido: boolean = false;
    pedidoSeleccionado: PedidoInstance | null = null;

    constructor(
        private _pedidoService: PedidoService,
        private router: Router,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private confirmationService: ConfirmationService,
    ) {
        this.formMotivoAnulacionPedido = this.fb.group({
            motivoAnulacion: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.getListPedidosActivos();
        this.getListPedidosAnulados();

    }

    getListPedidosActivos() {
        this._pedidoService.getListPedidos().subscribe((data: any) => {
            this.listPedidosActivos = data.listaPedidos.filter((pedido: any) => {
                return (pedido.estado === 'Registrado' || pedido.estado === 'En proceso') && pedido.estadoPedido == true;
            });
        });
    }

    getListPedidosAnulados() {
        this._pedidoService.getListPedidos().subscribe((data: any) => {
            this.listPedidosAnulados = data.listaPedidos.filter((pedido: any) => {
                return (pedido.estado === 'Registrado' || pedido.estado === 'En proceso') && pedido.estadoPedido == false;
            });
        });
    }



    mostrarPedidos() {
        if (this.mostrarPedidosActivos == true) {
            this.mostrarPedidosActivos = false
        } else {
            this.mostrarPedidosActivos = true
        }
    }

    async mostrarDetallePedido(id: number) {
        try {
            this.detallePedido = await this._pedidoService.getPedido(id).toPromise();
            this.mostrarModalDetalle = true;
        } catch (error) {
            console.error('Error al obtener el detalle del pedido:', error);
        }
    }

    editarPedido(id: number): void {
        this.router.navigate(['/pages/pedido/add', id]);
    }

    anularPedido(pedido: PedidoInstance): void {
        this.pedidoSeleccionado = pedido;
        this.showConfirmationDialogPedido = true;
        this.formMotivoAnulacionPedido.reset();
    }

    confirmActionPedido(confirm: boolean): void {
        if (confirm && this.pedidoSeleccionado) {

            this.formMotivoAnulacionPedido.markAllAsTouched();

            if (this.formMotivoAnulacionPedido.valid) {
                const id = this.pedidoSeleccionado.id ?? 0;
                const motivoAnulacion = this.formMotivoAnulacionPedido.value.motivoAnulacion;

                this._pedidoService.anularPedido(id, false, motivoAnulacion).subscribe(
                    (response) => {
                        this.toastr.success('El pedido se anuló correctamente.', 'pedido Anulado');
                        this.getListPedidosActivos();
                        this.getListPedidosAnulados();
                    },
                    (error) => {
                        console.error('Error al anular el pedido:', error);
                    }
                );

                this.showConfirmationDialogPedido = false;
                this.pedidoSeleccionado = null;
            } else {
                this.toastr.error('Complete los campos requeridos')
            }
        }
    }

    exportToExcel() {
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

        this.listPedidosActivos.forEach(pedido => {
            if (pedido.estadoPedido == true) {
                const row = [
                    pedido.cliente,
                    pedido.ordenTrabajo,
                    pedido.fechaOrdenTrabajo,
                    pedido.fechaEntregaOrden,
                    pedido.referencia,
                    pedido.descripcion,
                    { t: 'n', v: pedido.valorUnitario },
                    { t: 'n', v: pedido.cantidadTotal },
                    pedido.formaPago,
                    { t: 'n', v: pedido.valorTotal }
                ];

                data.push(row)
            };
        });

        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');

        XLSX.writeFile(wb, 'pedidos.xlsx')
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

    ValidacionMotivoAnulacion() {
        const motivoAnulacionControl = this.formMotivoAnulacionPedido.get('motivoAnulacion');
        const motivoAnulacionValue = motivoAnulacionControl?.value;
        const minCaracteres = 10;

        if (motivoAnulacionControl?.hasError('required')) {
            return;
        }

        if (motivoAnulacionValue && motivoAnulacionValue.length < minCaracteres) {
            motivoAnulacionControl?.setErrors({ minlength: true });
        } else {
            motivoAnulacionControl?.setErrors(null);
        }
    }
}
