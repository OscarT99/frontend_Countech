/*
import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { VentaService } from 'src/app/services/venta/venta.service';
import { Venta } from 'src/app/interfaces/venta/venta.interface';
import { Cliente } from 'src/app/interfaces/cliente/cliente.interface';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { AbonoVenta } from 'src/app/interfaces/abonoVenta/abonoVenta.interface';
import { AbonoVentaService } from 'src/app/services/abonoVenta/abonoVenta.service';
import { AbonoVentaComponent } from '../abonoVenta/abonoVenta.component'; 
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';


import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';




@Component({
  templateUrl: './venta.component.html',
  providers: [ConfirmationService, MessageService]

})
export class VentaComponent implements OnInit {

  formAddAbono : FormGroup;
  
  listAbonoVentas: AbonoVenta [] = []
  abonoVenta: AbonoVenta = {}
  listVentas: Venta[] = []
  listClientes: Cliente[] = []
  venta: Venta = {}
  formAbonoVenta: FormGroup;
  formVenta: FormGroup;

  id: number = 0;

  valSwitch: boolean = false;
  showConfirmationDialog: boolean = false;
  ventaSeleccionado: Venta | null = null;
  switchState: boolean | undefined = undefined;


  estadoPago: SelectItem[] = [
    { label: 'Pago', value: 'Pago' },
    { label: 'Pendiente', value: 'Pendiente' }
  ];
  selectedEstadoPago: SelectItem = { value: '' };


  value8: any;
  value9: any;


  productDialogAbono: boolean = false;
  productDialogDetalle: boolean = false;


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


  ) {
    this.formVenta = this.fb.group({
      id: ['', Validators.required],
      cliente: ['', Validators.required],
      ordenTrabajo: ['', Validators.required],
      fechaVenta: ['', Validators.required],
      formaPago: ['', Validators.required],
      valorTotal: ['', Validators.required],
      estadoPago: ['', Validators.required],
      valorRestante:[0]
    })
    this.formAbonoVenta = this.fb.group({
      id: ['', Validators.required],
      venta: ['', Validators.required],
      fechaAbono: ['', Validators.required],
      valorAbono: ['', Validators.required],
    }),
    this.formAddAbono =  this.fb.group({
      valorAbonoRegistrar:[]
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
      // Actualiza la variable de la venta con los datos recuperados
      this.venta = data;
  
      // Verifica si la venta tiene un cliente asociado
      if (this.venta.cliente) {
        // Aquí puedes llamar a una función que recupere el nombre del cliente
        this.getNombreCliente(this.venta.cliente);
      }
  
      this.formVenta.setValue({
        id: data.id,
        cliente: data.cliente,
        ordenTrabajo: data.ordenTrabajo,
        fechaVenta: data.fechaVenta,
        formaPago: data.formaPago,
        valorTotal: data.valorTotal,
        estadoPago: data.estadoPago,
        valorRestante: this.calcularValorRestante(this.listAbonoVentas)  // Calcula el valor restante utilizando la lista filtrada
      });
  
      this.filtrarAbonosPorVenta(id);  // Llamada después de obtener la venta
    });
  }
  
  
  
  


  addVenta() {
    const venta: Venta = {
      id: this.formVenta.value.id,
      cliente: this.formVenta.value.cliente,
      ordenTrabajo: this.formVenta.value.ordenTrabajo,
      fechaVenta: this.formVenta.value.fechaVenta,
      formaPago: this.formVenta.value.formaPago,
      valorTotal: this.formVenta.value.valorTotal,
      estadoPago: this.formVenta.value.estadoPago
    }

    if (this.id !== 0) {
      venta.id = this.id
      this._ventaService.putVenta(this.id, venta).subscribe(() => {
        this.productDialogAbono = false;
        this.toastr.info(`La venta fue actualizada con éxito`, `Venta actualizado`)
        this.getListVentas();
      })
    }

    this.productDialogAbono = false;
  }


  navigateToVentaList() {
    // Lógica para cargar la lista de ventas actualizada
    // ...
    // Navegar a la ruta donde se encuentra la lista de ventas actualizada
    this.getListVentas();

    //this.router.navigate(['/pages/venta']);
}



  openNew() {
    this.id = 0;                
    this.formVenta.reset()
    this.formVenta.patchValue({
      valorRestante: this.formVenta.value.valorTotal
    });
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
      this.agregarAbonoVenta();
      // console.log(this.getValorRestante());   
    },
    reject: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Cancelado',
        detail: 'El abono no fue agregado a la venta'
      });
    }
  });
}




  hideDialog() {
    this.productDialogAbono = false;
    this.productDialogDetalle = false;

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
        venta.cliente,
        venta.ordenTrabajo,
        venta.fechaVenta,
        venta.formaPago,
        venta.valorTotal,
        venta.estadoPago ? 'Pago' : 'Pendiente'
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
  agregarAbonoVenta() {
    const valorAbonoActual = this.formAddAbono.value.valorAbonoRegistrar;
  
    const nuevoAbono: AbonoVenta = {
      valorAbono: valorAbonoActual,
      fechaAbono: new Date(),
      venta: this.id
    };
  
    this._abonoVentaService.postAbonoVenta(nuevoAbono).subscribe(
      () => {
        // Actualizar la lista de abonos después de agregar uno nuevo
        this.getListAbonoVentas();
  
        // Restaurar el formulario de agregar abono
        this.formAddAbono.reset();
  
        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Agregado',
          detail: 'El abono se agregó exitosamente a la venta'
        });
  
        // Calcular y actualizar el valor restante
        this.calcularValorRestante();
      },
      (error) => {
        console.error('Error al agregar abono de venta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Hubo un error al agregar el abono a la venta'
        });
      }
    );
  }
  
  
  
  

  newAbonoVenta(id: number) {
    this.id = id;
    this.productDialogAbono = true;
    this.getVenta(id);
    
    // Filtra los abonos por la venta seleccionada
    this.filtrarAbonosPorVenta(id);
    this.getListAbonoVentas();
  }


  //Listar abonos de la venta seleccionada
  filtrarAbonosPorVenta(ventaId: number) {
    if (this.id !== 0) {
      this._abonoVentaService.getListAbonoVentas().subscribe((data: any) => {
        this.listAbonoVentas = data.listAbonoVentas.filter((abono: AbonoVenta) => abono.venta === ventaId);
        this.calcularValorRestante(this.listAbonoVentas); // Pasa la lista filtrada a la función
      });
    }
  }
  
  
  
  
  
  // getValorRestante(): number {
  //   //if (this.listAbonoVentas && this.listAbonoVentas.length > 0 && this.venta && typeof this.venta.valorTotal === 'number') {
  //     let abonosTotal = this.listAbonoVentas.reduce((total, abono) => total + (abono.valorAbono || 0), 0);
  //     let valorRestante = 0
  //     return valorRestante;
  //   //Resultado 050000.0020000.0060000.0040000.0040000.0020000.0017000.001000.003000.001000.001500.001000.001000.00
  // }
  


  //DETALLE VENTA
  detalleVenta(id: number) {
    this.id = id;
    this.productDialogDetalle = true;
    this.getVenta(id);
    // Filtra los abonos por la venta seleccionada
    this.filtrarAbonosPorVenta(id);
    this.getListAbonoVentas();
  }

  calcularValorRestante(abonos: AbonoVenta[] = []) {
    const abonosTotal = abonos.reduce((total, abono) => total + (abono.valorAbono || 0), 0);
    const valorTotal = this.venta ? this.venta.valorTotal : this.formVenta.value.valorTotal;
    const nuevoValorRestante = valorTotal - abonosTotal;
  
    this.formVenta.patchValue({
      valorRestante: nuevoValorRestante
    });
  
    return nuevoValorRestante;
  }  
}
*/



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
import { AbonoVentaComponent } from '../abonoVenta/abonoVenta.component'; 
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
  
  listAbonoVentas: AbonoVenta [] = []
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
  detallePedido: any; // Puedes ajustar esto según la estructura de tu pedido
  @ViewChild('detallePedidoModal') detallePedidoModal!: Dialog;
  @ViewChild('comprobanteVenta') comprobanteVenta!: ElementRef;
  
 
  generarPDF() {
    const element = this.comprobanteVenta.nativeElement;

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('comprobante_venta.pdf');
    });
  }
  
  id: number = 0;

  valSwitch: boolean = false;
  showConfirmationDialog: boolean = false;
  ventaSeleccionado: Venta | null = null;
  switchState: boolean | undefined = undefined;

/*
  estadoPago: SelectItem[] = [
    { label: 'Pago', value: 'Pago' },
    { label: 'Pendiente', value: 'Pendiente' }
  ];
  selectedEstadoPago: SelectItem = { value: '' };
*/

  value8: any;
  value9: any;


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
    private _pedidoService:PedidoService,



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
    this.getListPedidos() 
    this.verificarFormaPago()                              

  }
  getListPedidos(){     
    this._pedidoService.getListPedidos().subscribe((data:any) =>{              
      this.listPedidos = data.listaPedidos; 
     
    })        
  }


  async mostrarDetallePedido(id: number) {
    try {
        this.detallePedido = await this._pedidoService.getPedido(id).toPromise();
        console.log('Detalle del pedido:', this.detallePedido);
        this.mostrarModalDetalle = true;
    } catch (error) {
        console.error('Error al obtener el detalle de la venta:', error);
    }
  }

  async comprobanteVenta1(id: number) {
    try {
        this.detallePedido = await this._pedidoService.getPedido(id).toPromise();
        console.log('Comprobante de Venta:', this.detallePedido);
        this.mostrarComprobante = true;
    } catch (error) {
        console.error('Error al obtener el comprobante de venta:', error);
    }
  }

  esPagoPendiente(estadoPago: string): boolean {
    return estadoPago === 'Pendiente';
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
      console.log(data)

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

      this.venta = data; // Actualiza la variable de la venta con los datos recuperados
      
      // Verifica si la venta tiene un cliente asociado
      if (this.venta.cliente) {
        // Aquí puedes llamar a una función que recupere el nombre del cliente
        this.getNombreCliente(this.venta.cliente);
      }

    })
  }


  addVenta() {
    const venta: Venta = {
      id: this.formVenta.value.id,
      cliente: this.formVenta.value.cliente,
      ordenTrabajo: this.formVenta.value.ordenTrabajo,
      fechaVenta: this.formVenta.value.fechaVenta,
      formaPago: this.formVenta.value.formaPago,
      valorTotal: this.formVenta.value.valorTotal,
      estadoPago: this.formVenta.value.estadoPago
    }

    if (this.id !== 0) {
      venta.id = this.id
      this._ventaService.putVenta(this.id, venta).subscribe(() => {
        this.productDialogAbono = false;
        this.toastr.info(`La venta fue actualizada con éxito`, `Venta actualizado`)
        this.getListVentas();
      })
    }

    this.productDialogAbono = false;
  }


  navigateToVentaList() {
    // Lógica para cargar la lista de ventas actualizada
    // ...
    // Navegar a la ruta donde se encuentra la lista de ventas actualizada
    this.getListVentas();

    //this.router.navigate(['/pages/venta']);
}



  openNew() {
    this.id = 0;                
    this.formVenta.reset()
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
      const valorRestante = this.getValorRestante();

      if (valorRestante === 0) {
        this.actualizarEstadoPago(this.id, 'Pago');
      }

      this.agregarAbonoVenta(this.value9);
      console.log(this.getValorRestante());
      this.value9 = undefined; 
      this.formVenta.get('valorRestante')?.setValue(valorRestante);
      
      
    },
    reject: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Cancelado',
        detail: 'El abono no fue agregado a la venta'
      });
    }
  });
}




  hideDialog() {
    this.productDialogAbono = false;
    this.productDialogDetalle = false;

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
        venta.cliente,
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


  
  //Cambiar estado de pago
  actualizarEstadoPago(id: number, estado: "Pago" | "Pendiente"): void {
    const ventaActualizada: Venta = {
      estadoPago: estado
    };
  
    this._ventaService.putVenta(id, ventaActualizada).subscribe(
      () => {
        console.log('Estado de pago actualizado exitosamente.');
  
        // Recargar la página después de actualizar el estado de pago
        window.location.reload();
      },
      (error) => {
        console.error('Error al actualizar el estado de pago:', error);
        // Aquí puedes manejar el error de acuerdo a tus necesidades
      }
    );
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
  /*
  agregarAbonoVenta(valorAbono: number) {
    const nuevoAbono: AbonoVenta = {
      valorAbono: valorAbono,
      fechaAbono: new Date(), 
      venta: this.id 
    };
  
    this._abonoVentaService.postAbonoVenta(nuevoAbono).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Agregado',
          detail: 'El abono se agregó exitosamente a la venta'
        });
        this.getListAbonoVentas(); // Actualiza la lista de abonos de venta después de agregar uno nuevo
        //this.hideDialog(); // Cierra el diálogo después de agregar el abono de venta
      },
      (error) => {
        console.error('Error al agregar abono de venta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Hubo un error al agregar el abono a la venta'
        });
      }
    );
  }
  */
/*
  agregarAbonoVenta(valorAbono: number) {
    const nuevoAbono: AbonoVenta = {
      valorAbono: valorAbono,
      fechaAbono: new Date(),
      venta: this.id
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
        this._abonoVentaService.postAbonoVenta(nuevoAbono).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Agregado',
              detail: 'El abono se agregó exitosamente a la venta'
            });
            this.getListAbonoVentas(); // Actualiza la lista de abonos de venta después de agregar uno nuevo
            //this.hideDialog(); // Cierra el diálogo después de agregar el abono de venta
          },
          (error) => {
            console.error('Error al agregar abono de venta:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Hubo un error al agregar el abono a la venta'
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
*/

agregarAbonoVenta(valorAbono: number) {
  const nuevoAbono: AbonoVenta = {
    valorAbono: valorAbono,
    fechaAbono: new Date(),
    venta: this.id
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
      this._abonoVentaService.postAbonoVenta(nuevoAbono).subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Agregado',
            detail: 'El abono se agregó exitosamente a la venta'
          });
          this.getListAbonoVentas(); // Actualiza la lista de abonos de venta después de agregar uno nuevo
          //this.hideDialog(); // Cierra el diálogo después de agregar el abono de venta
          
          // Después de agregar un nuevo abono, verifica si el valor restante es 0
          // Si es 0, actualiza el estado de pago a "Pago"
          const nuevoValorRestante = this.getValorRestante();
          if (nuevoValorRestante === 0) {
            this.actualizarEstadoPago(this.id, 'Pago');
          }
        },
        (error) => {
          console.error('Error al agregar abono de venta:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Hubo un error al agregar el abono a la venta'
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


  newAbonoVenta(id: number) {
    this.id = id;
    this.productDialogAbono = true;
    this.getVenta(id);
    
    // Filtra los abonos por la venta seleccionada
    this.filtrarAbonosPorVenta(id);
    this.getListAbonoVentas();
  }


  //Listar abonos de la venta seleccionada
  filtrarAbonosPorVenta(ventaId: number) {
    // Filtra la lista de abonos para mostrar solo los abonos asociados a la venta seleccionada
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








  //DETALLE VENTA
  detalleVenta(id: number) {
    this.id = id;
    this.productDialogDetalle = true;
    this.getVenta(id);
    // Filtra los abonos por la venta seleccionada
    this.filtrarAbonosPorVenta(id);
    this.getListAbonoVentas();
  }
  

  mostrarTablaAbonos: boolean = false;


  // Lógica para mostrar la tabla de abonos si la forma de pago es "Crédito"
  verificarFormaPago() {
    if (this.detallePedido && this.detallePedido.formaPago === 'Crédito') {
      this.mostrarTablaAbonos = true;
    } else {
      this.mostrarTablaAbonos = false;
    }
  }
  

/*
  marcarComoPagada(): void {
    const valorRestante = this.getValorRestante();
    if (valorRestante === 0) {
        
        // Llama al servicio para actualizar el estado de pago a "Pago"
        this._ventaService.putVenta(this.venta.id, 'Pago').subscribe(
            () => {
                this.toastr.success('La venta se ha marcado como pagada correctamente.', 'Venta Pagada');
                // Realiza cualquier otra lógica necesaria después de marcar la venta como pagada
                // Por ejemplo, volver a cargar la lista de ventas
                this.getListVentas();
            },
            (error) => {
                console.error('Error al marcar la venta como pagada:', error);
                this.toastr.error('Hubo un error al marcar la venta como pagada.', 'Error');
            }
        );
    } else {
        // Muestra un mensaje de advertencia si el valor restante es diferente de 0
        this.toastr.warning('La venta no se puede marcar como pagada porque el valor restante es diferente de 0.', 'Advertencia');
    }
}*/

}


