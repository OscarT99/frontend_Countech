import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CompraService } from 'src/app/services/compra/compra.service';
import { CompraInstance } from 'src/app/interfaces/compra/compra.interface';
import { InsumoService } from 'src/app/services/insumo/insumo.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import * as XLSX from 'xlsx';


import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbonoCompra } from 'src/app/interfaces/abonoCompra/abonoCompra.interface';
import { AbonoCompraService } from 'src/app/services/abonoCompra/abonoCompra.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TotalNetoService } from '../compra.servive';
import { DetalleCompraInstance } from 'src/app/interfaces/compra/detalleCompra.interface';
import { ProveedorService } from 'src/app/services/proveedor/proveedor.service';
import { Proveedor } from 'src/app/interfaces/proveedor/proveedor.interface';

@Component({
    templateUrl: './list.compra.component.html',
    providers: [ConfirmationService, MessageService]


})
export class ListCompraComponent implements OnInit {
    compra: CompraInstance = {}


    formMotivoAnulacion: FormGroup;
    mostrarComprasActivas: boolean = true;

    showConfirmationDialogCompra: boolean = false;
    compraSeleccionada: CompraInstance | null = null;

    listAbonoCompras: AbonoCompra[] = []
    abonoCompra: AbonoCompra = {}
    formAbonoCompra: FormGroup;
    listProveedores: Proveedor[] = []

    listComprasActivas: CompraInstance[] = [];
    listComprasAnuladas: CompraInstance[] = [];


    id: number = 0;
    totalNeto: number = 0;

    mostrarModalDetalle: boolean = false;
    detalleCompra: any; // Puedes ajustar esto según la estructura de tu pedido
    detallesInsumo: DetalleCompraInstance[] = [];

    @ViewChild('detalleCompraModal') detallePedidoCompra!: Dialog;

    rowsPerPageOptions = [5, 10, 15];
    compraSeleccionado: CompraInstance | null = null;


    constructor(
        private _compraService: CompraService,
        private _abonoCompraService: AbonoCompraService,
        private _insumoService: InsumoService,
        private toastr: ToastrService,
        private aRouter: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private totalNetoService: TotalNetoService,
        private _proveedorService: ProveedorService,
    ) {
        this.formMotivoAnulacion = this.fb.group({
            motivoAnulacion: ['', Validators.required]
        }),
            this.formAbonoCompra = this.fb.group({
                id: ['', Validators.required],
                proveedor: ['', Validators.required],
                totalNeto: ['', Validators.required],
                estadoPago: ['', Validators.required],
                valorRestante: [{ value: 0, disabled: true }],
            })
        this.aRouter.params.subscribe(params => {
            this.id = +params['id'];
        });

    }

    ngOnInit(): void {
        this.getListComprasAtivas();
        this.getListComprasAnuladas();
        this.formAbonoCompra.get('valorRestante')?.setValue(this.getValorRestante());
    }


    getTotalNeto(id: number): void {
        this._compraService.getCompra(id).subscribe((data: CompraInstance) => {
            const valorNetoCompra = data.totalNeto;
            console.log('Valor neto de la compra con ID', id, ':', valorNetoCompra);
            // Aquí puedes hacer lo que necesites con el valor neto de la compra, como almacenarlo en una variable
        });
    }

    getListComprasAtivas() {
        this._compraService.getListCompras().subscribe((data: any) => {
            this.listComprasActivas = data.listaCompras.filter((compra: any) => {
                return compra.estadoCompra === true
            });
        });
    }

    getListComprasAnuladas() {
        this._compraService.getListCompras().subscribe((data: any) => {
            this.listComprasAnuladas = data.listaCompras.filter((compra: any) => {
                return compra.estadoCompra === false
            });
        });
    }

    getListProveedores() {
        this._proveedorService.getListProveedores().subscribe((data: any) => {
            this.listProveedores = data.listProveedores;
        })
    }

    getNombreProveedor(proveedorId?: number): string {
        if (proveedorId === undefined) {
            return 'Proveedor no encontrado';
        }

        const proveedor = this.listProveedores.find(c => c.id === proveedorId);
        return proveedor ? proveedor.razonSocial || 'Nombre no disponible' : 'Proveedor no encontrado';
    }


    mostrarCompras() {
        if (this.mostrarComprasActivas === true) {
            this.mostrarComprasActivas = false
        } else {
            this.mostrarComprasActivas = true
        }
    }


    async mostrarDetalleCompra(id: number) {
        this.detalleCompra = await this._compraService.getCompra(id).toPromise();

        this.totalNeto = this.detalleCompra.totalNeto;
        console.log('total neto detalle de compra', this.totalNeto);


        this.mostrarModalDetalle = true;
        this.mostrarTablaAbonos = false;
        this.id = id;
        this.getCompra(id);
        // Filtra los abonos por la compra seleccionada
        this.filtrarAbonosPorCompra(id);
        this.getListAbonoCompras();

    }

    anularCompra(compra: CompraInstance): void {
        this.compraSeleccionada = compra;
        this.showConfirmationDialogCompra = true;
        this.formMotivoAnulacion.reset();
    }

    confirmActionCompra(confirm: boolean): void {
        if (confirm && this.compraSeleccionada) {

            this.formMotivoAnulacion.markAllAsTouched();

            if (this.formMotivoAnulacion.valid) {
                const id = this.compraSeleccionada.id ?? 0;
                const motivoAnulacion = this.formMotivoAnulacion.value.motivoAnulacion

                // Llamar al servicio de anulación de compra
                this._compraService.anularCompra(id, false, motivoAnulacion).subscribe(
                    (anularResponse) => {
                        this.toastr.success('La compra se anuló correctamente.', 'Compra Anulada');
                        this.getListComprasAtivas();
                        this.getListComprasAnuladas();

                        if (this.compraSeleccionada && this.compraSeleccionada.DetalleEnCompras) {
                            // Obtener la cantidad de cada detalle
                            const cantidades = this.compraSeleccionada!.DetalleEnCompras.map(detalle => detalle?.cantidad);

                            // Llamar al servicio para restar cantidad de insumo para cada detalle
                            for (const cantidad of cantidades) {
                                if (cantidad !== undefined) {
                                    this._insumoService.restarCantidadInsumoCompra(id, cantidad).subscribe();
                                }
                            }
                        }
                    });
            } else {
                this.toastr.error('Complete los campos requeridos')
            }
        }

        this.showConfirmationDialogCompra = false;
        this.compraSeleccionada = null;
    }

    //Abono Compras
    value8: any;
    value9: any;
    productDialogAbono: boolean = false;


    getCompra(id: number) {
        this._compraService.getCompra(id).subscribe((data: CompraInstance) => {
            this.formAbonoCompra = this.fb.group({
                id: ['', Validators.required],
                proveedor: ['', Validators.required],
                numeroFactura: ['', Validators.required],
                fechaCompra: ['', Validators.required],
                formaPago: ['', Validators.required],
                totalBruto: ['', Validators.required],
                ivaTotal: ['', Validators.required],
                totalNeto: ['', Validators.required],
                estadoPago: ['', Validators.required],
                valorRestante: [{ value: 0, disabled: true }],
            })

            this.formAbonoCompra.patchValue({
                id: data.id,
                proveedor: data.proveedor,
                numeroFactura: data.numeroFactura,
                fechaCompra: data.fechaCompra,
                formaPago: data.formaPago,
                totalBruto: data.totalBruto,
                ivaTotal: data.iva,
                totalNeto: data.totalNeto,
                estadoPago: data.estadoPago,
            })

            //Llama el nombre del proveedor
            if (this.compra.proveedor) {
                this.getNombreProveedor(this.compra.proveedor);
            }


        })
    }



    //ABONOS
    newAbonoCompra(id: number) {
        this.id = id;
        this.value9 = null;

        this.productDialogAbono = true;
        this.getCompra(id);

        // Filtra los abonos por la compra seleccionada
        this.filtrarAbonosPorCompra(id);
        this.getListAbonoCompras();

        this.getTotalNeto(id);
    }

    confirm21(event: Event) {
        this.confirmationService.confirm({
            key: 'confirm2',
            target: event.target || new EventTarget,
            message: '¿Está seguro de realizar el abono?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            accept: () => {
                this.agregarAbonoCompra(this.value9);
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

    confirm2(event: Event) {
        if (this.camposValidos) {

            this.confirmationService.confirm({
                key: 'confirm2',
                target: event.target || new EventTarget,
                message: '¿Está seguro de realizar el abono?',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Sí',
                accept: () => {
                    this.agregarAbonoCompra(this.value9);

                    const valorRestante = this.getValorRestante()
                    const nuevoValorRestante = valorRestante - this.value9
                    if (nuevoValorRestante === 0) {
                        this.actualizarEstadoPago(this.id, 'Pago');
                        this.toastr.info(`Se ha completado el pago de la compra con éxito, el estado de la compra es PAGO.`, `Pago completado`, { timeOut: 10000 });
                    }
                },
                reject: () => {
                    this.toastr.error('El abono no se agregó a la compra', 'Cancelado');
                }
            });
        } else {
            this.toastr.error('Ingrese un valor de abono válido', 'Error de validación');
        }
    }


    //VALIDACIÓN valor abono
    errorMessages = {
        valorAbono: ''
    }

    camposValidos: boolean = false;

    validarValorAbono() {
        const valorAbono = this.value9;
        const valorRestante = 10000000;
        const minValorAbono = 5000;
        const validacion = /^\d+$/;

        if (valorAbono) {
            if (valorAbono === null || valorAbono.trim() === '' || valorAbono === "") {
                this.errorMessages.valorAbono = 'El campo valor abono es requerido.';
                this.camposValidos = false;
            } else if (!validacion.test(valorAbono)) {
                this.errorMessages.valorAbono = 'Solo se permiten números.';
                this.camposValidos = false;
            } else if (valorAbono > valorRestante) {
                this.errorMessages.valorAbono = 'El valor abono no puede ser mayor al valor restante.';
                this.camposValidos = false;
            } else if (valorAbono < minValorAbono) {
                this.errorMessages.valorAbono = `El valor mínimo permitido es $5.000.`;
                this.camposValidos = false;
            } else {
                this.errorMessages.valorAbono = '';
                this.camposValidos = true;
            }
        }
    }


    agregarAbonoCompra1(valorAbono: number) {
        const nuevoAbono: AbonoCompra = {
            valorAbono: valorAbono,
            fechaAbono: new Date(),
            compra: this.id
        };

        // Verificar si el valor restante es 0 antes de agregar un nuevo abono
        //const valorRestante = this.getValorRestante();
        const valorRestante = 10000000
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

    agregarAbonoCompra(valorAbono: number) {
        const nuevoAbono: AbonoCompra = {
            valorAbono: valorAbono,
            fechaAbono: new Date(),
            compra: this.id
        };
       //const valorRestante = this.getValorRestante();
        const valorRestante = 10000000

        if (valorRestante > -1) {

            this._abonoCompraService.postAbonoCompra(nuevoAbono).subscribe(
                () => {
                    this.value9 = null;
                    this.toastr.success('El abono se agregó exitosamente a la compra', 'Agregado');
                    this.getListAbonoCompras();
                },
                (error) => {
                    console.error('Error al agregar abono a la compra:', error);
                    this.toastr.error('Hubo un error al agregar el abono a la compra', 'Error');
                }
            );
        } else {
            this.toastr.error('No se pueden agregar más abonos, el valor restante es 0', 'Error de validación');
        }


    }

    actualizarEstadoPago(id: number, estado: "Pago" | "Pendiente"): void {
        const compraActualizada: CompraInstance = {
            estadoPago: estado
        };

        const valorRestante = this.getValorRestante()
        const nuevoValorRestante = valorRestante - this.value9
        console.log(nuevoValorRestante)
        if (nuevoValorRestante === 0) {
            this._compraService.putCompra(id, compraActualizada).subscribe(
                () => {
                    setTimeout(() => {
                        window.location.reload();
                    }, 7000);

                },
                (error) => {
                    console.error('Error al actualizar el estado de pago:', error);
                }
            );
        }
    }


    mostrarTablaAbonos: boolean = false;



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



    calcularTotales(): void {
        let totalBruto = 0;
        let ivaTotal = 0;
        let totalNeto = 0;

        this.detallesInsumo.forEach(detalle => {
            totalBruto += detalle.cantidad! * detalle.valorUnitario!;
            ivaTotal += detalle.cantidad! * detalle.impuestoIva!;
        });

        totalNeto = totalBruto + ivaTotal;

    }




    getValorRestante(): number {
        if (
            this.totalNeto !== undefined &&
            this.listAbonoCompras &&
            this.listAbonoCompras.length > 0
        ) {
            const abonosRelacionados = this.listAbonoCompras.filter(abono => abono.compra === this.id);

            if (abonosRelacionados.length > 0 && !isNaN(parseFloat(this.totalNeto.toString()))) {
                let totalAbonos = 0;

                abonosRelacionados.forEach(abono => {
                    if (abono.valorAbono !== undefined) {
                        const valorAbono = parseFloat(abono.valorAbono.toString());
                        if (!isNaN(valorAbono)) {
                            totalAbonos += valorAbono;
                        }
                    }
                });

                const valorRestante = this.totalNeto - totalAbonos;
                return valorRestante;
            }
        }

        // Si no hay abonos relacionados o si falta información, devuelve el total neto del servicio o 0 si no está definido
        return this.totalNeto !== undefined ? parseFloat(this.totalNeto.toString()) : 0;
    }


    getValorRestante1(): number {

        const abonosRelacionados = this.listAbonoCompras.filter(abono => abono.compra === this.id);

        let totalAbonos = 0;

        abonosRelacionados.forEach(abono => {
            if (abono.valorAbono !== undefined) {
                const valorAbono = parseFloat(abono.valorAbono.toString());
                if (!isNaN(valorAbono)) {
                    totalAbonos += valorAbono;
                }
            }
        });

        //const valorTotal = parseFloat(this.totalNeto.toString());
        // Suponiendo que valorTotal es un objeto con una propiedad 'valor'
        const valorTotal = this.getTotalNeto(this.id);
        console.log("Este es el valor total en getValorRestante1: ", valorTotal);

        const valorRestante = 0;
        // Verificar si valorTotal es un número antes de realizar la operación
        if (typeof valorTotal === 'number') {
            console.log("Este es el valor total en getValorRestante: ", valorTotal);
            const valorRestante = valorTotal - totalAbonos;
            return valorRestante;

            // Lógica adicional con valorRestante
        } else {
            console.error('El valor total no es un número.');
        }

        return valorRestante;



        // Si no hay abonos relacionados o si falta información, devuelve el valor total de la venta o 0 si no está definido
        //return this.compra && this.totalNeto !== undefined ? parseFloat(this.totalNeto.toString()) : 0;
    }



    exportToExcel() {
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


        this.listComprasActivas.forEach(compra => {
            if (compra.estadoCompra == true) {
                const row = [
                    compra.Proveedor?.razonSocial,
                    compra.numeroFactura,
                    compra.fechaCompra,
                    compra.formaPago,
                    { t: 'n', v: compra.totalBruto },
                    { t: 'n', v: compra.iva },
                    { t: 'n', v: compra.totalNeto }
                ];

                data.push(row);
            };
        });

        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Compras');

        XLSX.writeFile(wb, 'compras.xlsx')
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

    getSeverityEstadoPago(estadoPago: string) {
        return estadoPago === 'Pago' ? 'success' : 'warning';
    }

    ValidacionMotivoAnulacion() {
        const motivoAnulacionControl = this.formMotivoAnulacion.get('motivoAnulacion');
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
