import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Product } from 'src/app/interfaces/product';
import { SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { VentaService } from 'src/app/services/venta/venta.service';
import { Venta } from 'src/app/interfaces/venta/venta.interface';
import { Cliente } from 'src/app/interfaces/cliente/cliente.interface';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { AbonoVenta } from 'src/app/interfaces/abonoVenta/abonoVenta.interface';
import { AbonoVentaService } from 'src/app/services/abonoVenta/abonoVenta.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PedidoService } from 'src/app/services/pedido/pedido.service';
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface';
import { Dialog } from 'primeng/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';

//PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
  templateUrl: './venta.component.html',
  providers: [ConfirmationService, MessageService]

})
export class VentaComponent implements OnInit {

  listAbonoVentas: AbonoVenta[] = []
  abonoVenta: AbonoVenta = {}
  listVentas: Venta[] = []
  listClientes: Cliente[] = []
  venta: Venta = {}
  formAbonoVenta: FormGroup;
  formVenta: FormGroup;

  listPedidos: PedidoInstance[] = []
  pedido: PedidoInstance = {}
  mostrarModalDetalle: boolean = false;
  mostrarComprobante: boolean = false;
  pedidoIdSeleccionado!: number;
  detallePedido: any; 
  @ViewChild('detallePedidoModal') detallePedidoModal!: Dialog;
  @ViewChild('comprobanteVenta') comprobanteVenta!: ElementRef;




  id: number = 0;

  valSwitch: boolean = false;
  showConfirmationDialog: boolean = false;
  ventaSeleccionado: Venta | null = null;
  switchState: boolean | undefined = undefined;

  value8: any;

  //ValorAbono
  value9: any;

  //Mostrar modales
  productDialogAbono: boolean = false;
  productDialogDetalle: boolean = false;


  products: Product[] = [];

  product: Product = {};

  selectedProducts: Product[] = [];

  rowsPerPageOptions = [5, 10, 15];


  constructor(private fb: FormBuilder,
    private _ventaService: VentaService,
    private _clienteService: ClienteService,
    private _abonoVentaService: AbonoVentaService,
    private toastr: ToastrService,
    private aRouter: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private _pedidoService: PedidoService,
  ) {
    this.formVenta = this.fb.group({
      id: ['', Validators.required],
      cliente: ['', Validators.required],
      ordenTrabajo: ['', Validators.required],
      fechaVenta: ['', Validators.required],
      formaPago: ['', Validators.required],
      valorTotal: ['', Validators.required],
      estadoPago: ['', Validators.required],
      valorRestante: [{ value: 0, disabled: true }],

    })
    this.formAbonoVenta = this.fb.group({
      id: ['', Validators.required],
      venta: ['', Validators.required],
      fechaAbono: ['', Validators.required],
      valorAbono: ['', Validators.required],
      valorRestante: [{ value: 0, disabled: true }],
    })
    this.aRouter.params.subscribe(params => {
      this.id = +params['id'];
    });

  }



  ngOnInit(): void {
    this.getListVentas()
    this.getListClientes()
    this.getListAbonoVentas()
  }

  mostrarTablaAbonos: boolean = false;


  async mostrarDetallePedido(id: number) {
    try {
      this.detallePedido = await this._pedidoService.getPedido(id).toPromise();
      //console.log('Detalle del pedido:', this.detallePedido);
      this.mostrarModalDetalle = true;
      this.mostrarTablaAbonos = false;
      this.id = id;
      this.getVenta(id);
      // Filtra los abonos por la venta seleccionada
      this.filtrarAbonosPorVenta(id);
      this.getListAbonoVentas();
    } catch (error) {
      //console.error('Error al obtener el detalle de la venta:', error);
    }
  }

  async comprobanteVenta1(id: number) {
    try {
      this.detallePedido = await this._pedidoService.getPedido(id).toPromise();
      //console.log('Comprobante de Venta:', this.detallePedido);
      this.mostrarComprobante = true;
    } catch (error) {
      //console.error('Error al obtener el comprobante de venta:', error);
    }
  }


  getListClientes() {
    this._clienteService.getListClientes().subscribe((data: any) => {
      this.listClientes = data.listClientes;
    })
  }

  getNombreCliente(clienteId?: number): string {
    if (clienteId === undefined) {
      return 'Cliente no encontrado';
    }

    const cliente = this.listClientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombreComercial || 'Nombre no disponible' : 'Cliente no encontrado';
  }

  getListVentas() {
    this._ventaService.getListVentas().subscribe((data: any) => {
      this.listVentas = data.listVentas;
    })
  }


  getVenta(id: number) {
    this._ventaService.getVenta(id).subscribe((data: Venta) => {
      //console.log(data)
      this.formVenta = this.fb.group({
        id: ['', Validators.required],
        cliente: ['', Validators.required],
        ordenTrabajo: ['', Validators.required],
        fechaVenta: ['', Validators.required],
        formaPago: ['', Validators.required],
        valorTotal: ['', Validators.required],
        estadoPago: ['', Validators.required],
      })
      this.formVenta.setValue({
        id: data.id,
        cliente: data.cliente,
        ordenTrabajo: data.ordenTrabajo,
        fechaVenta: data.fechaVenta,
        formaPago: data.formaPago,
        valorTotal: data.valorTotal,
        estadoPago: data.estadoPago
      })

      this.venta = data; 
      
      //Llama el nombre del cliente
      if (this.venta.cliente) {
        this.getNombreCliente(this.venta.cliente);
      }

    })
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
          this.agregarAbonoVenta(this.value9);
          
          const valorRestante = this.getValorRestante()
          const nuevoValorRestante = valorRestante - this.value9
          if (nuevoValorRestante === 0) {
            this.actualizarEstadoPago(this.id, 'Pago');
            this.toastr.info(`Se ha completado el pago de la venta con éxito, el estado de la venta es PAGO.`, `Pago completado`, { timeOut: 10000 });
          }
        },
        reject: () => {
          this.toastr.error('El abono no se agregó a la venta', 'Cancelado');
        }
      });
    } else {
      this.toastr.error('Ingrese un valor de abono válido', 'Error de validación');
    }
  }


  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportToExcel() {
    const data: any[] = []; // Array para almacenar los datos

    // Agregar encabezados a la matriz de datos
    const headers = [
      'Cliente',
      'Orden de Trabajo',
      'Fecha de Venta',
      'Forma de Pago',
      'Valor Total',
      'Estado de Pago'
    ];

    data.push(headers);

    this.listVentas.forEach(venta => {
      const row = [
        //venta.cliente,
        this.getNombreCliente(venta.cliente),
        venta.ordenTrabajo,
        venta.fechaVenta,
        venta.formaPago,
        venta.valorTotal,
        venta.estadoPago,
      ];

      data.push(row);
    });

    // Crear un libro de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    // Guardar el libro de Excel como archivo
    XLSX.writeFile(wb, 'ventas.xlsx');

  }

  generarPDF() {
    const element = this.comprobanteVenta.nativeElement;
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      //const pdf = new jsPDF('p', 'mm', 'a4');
      const pdf = new jsPDF('p', 'mm', [70, 114]);

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`comprobanteVenta_${this.detallePedido.id}.pdf`);


    });
  }



  //Cambiar estado de pago
  actualizarEstadoPago(id: number, estado: "Pago" | "Pendiente"): void {
    const ventaActualizada: Venta = {
      estadoPago: estado
    };

    const valorRestante = this.getValorRestante()
    const nuevoValorRestante = valorRestante - this.value9
    //console.log(nuevoValorRestante)
    if (nuevoValorRestante === 0) {
      this._ventaService.putVenta(id, ventaActualizada).subscribe(
        () => {
          setTimeout(() => {
            window.location.reload();
          }, 7000);

        },
        (error) => {
          //console.error('Error al actualizar el estado de pago:', error);
        }
      );
    }
  }




  //ABONO VENTA

  //Listar Abonos
  getListAbonoVentas() {
    if (this.id !== 0) {
      this._abonoVentaService.getListAbonoVentas().subscribe((data: any) => {
        this.listAbonoVentas = data.listAbonoVentas.filter((abono: AbonoVenta) => abono.venta === this.id);
      });
    }
  }

  //Agregar abono 
  agregarAbonoVenta(valorAbono: number) {
    const nuevoAbono: AbonoVenta = {
      valorAbono: valorAbono,
      fechaAbono: new Date(),
      venta: this.id
    };
    const valorRestante = this.getValorRestante();
    
    if (valorRestante > 0) {

      this._abonoVentaService.postAbonoVenta(nuevoAbono).subscribe(
        () => {
          this.value9 = null;
          this.toastr.success('El abono se agregó exitosamente a la venta', 'Agregado');
          this.getListAbonoVentas();
        },
        (error) => {
          //console.error('Error al agregar abono de venta:', error);
          this.toastr.error('Hubo un error al agregar el abono a la venta', 'Error');
        }
      );
    } else {
      this.toastr.error('No se pueden agregar más abonos, el valor restante es 0', 'Error de validación');
    }


  }


  newAbonoVenta(id: number) {
    this.id = id;
    this.value9 = null;
    this.errorMessages.valorAbono = "";

    this.productDialogAbono = true;
    this.getVenta(id);

    // Filtra los abonos por la venta seleccionada
    this.filtrarAbonosPorVenta(id);
    this.getListAbonoVentas();
  }

  //Listar abonos de la venta seleccionada
  filtrarAbonosPorVenta(ventaId: number) {
    this.listAbonoVentas = this.listAbonoVentas.filter(abono => abono.venta === ventaId);
  }





  getValorRestante(): number {
    if (
      this.venta &&
      this.venta.valorTotal !== undefined &&
      this.listAbonoVentas &&
      this.listAbonoVentas.length > 0
    ) {
      const abonosRelacionados = this.listAbonoVentas.filter(abono => abono.venta === this.id);

      if (abonosRelacionados.length > 0 && !isNaN(parseFloat(this.venta.valorTotal.toString()))) {
        let totalAbonos = 0;

        abonosRelacionados.forEach(abono => {
          if (abono.valorAbono !== undefined) {
            const valorAbono = parseFloat(abono.valorAbono.toString());
            if (!isNaN(valorAbono)) {
              totalAbonos += valorAbono;
            }
          }
        });

        const valorTotal = parseFloat(this.venta.valorTotal.toString());
        const valorRestante = valorTotal - totalAbonos;
        return valorRestante;
      }
    }

    // Si no hay abonos relacionados o si falta información, devuelve el valor total de la venta o 0 si no está definido
    return this.venta && this.venta.valorTotal !== undefined ? parseFloat(this.venta.valorTotal.toString()) : 0;
  }



  //VALIDACIÓN valor abono
  errorMessages = {
    valorAbono: ''
  }

  camposValidos: boolean = false;

  validarValorAbono() {
    const valorAbono = this.value9;
    const valorRestante = this.getValorRestante();
    const minValorAbono = 99;
    const validacion = /^[\d,.]+$/;

   
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
      }  else if (valorAbono < minValorAbono) {
        this.errorMessages.valorAbono = `Ingrese un valor válido.`;
        this.camposValidos = false;
      } else {
        this.errorMessages.valorAbono = '';
        this.camposValidos = true;
      }
    }
  }

}


