import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { AbonoVentaService } from 'src/app/services/abonoVenta/abonoVenta.service';
import { AbonoVenta } from 'src/app/interfaces/abonoVenta/abonoVenta.interface';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import * as XLSX from 'xlsx';




@Component({
  templateUrl: './abonoVenta.component.html',
  
  providers: [ConfirmationService, MessageService]

})
export class AbonoVentaComponent implements OnInit {
  listAbonoVentas: AbonoVenta[] = []
  abonoVenta: AbonoVenta = {}
  formAbonoVenta: FormGroup;
  id: number = 0;

  valSwitch: boolean = false;
  showConfirmationDialog: boolean = false;
  abonoVentaSeleccionado: AbonoVenta | null = null;
  switchState: boolean | undefined = undefined;

  value8: any;

  productDialog: boolean = false;

  rowsPerPageOptions = [5, 10, 15];

  msgs: any[] = [];


  constructor(private fb: FormBuilder,
    private _abonoVentaService: AbonoVentaService,
    private toastr: ToastrService,
    private aRouter: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
  ) {
    this.formAbonoVenta = this.fb.group({
      venta: ['', Validators.required],
      fechaAbono: ['', Validators.required],
      valorAbono: ['0', Validators.required],
    })
    this.aRouter.params.subscribe(params => {
      this.id = +params['id']; // Obtén el valor del parámetro 'id' de la URL y actualiza id
    });
  }


  showErrorViaMessages() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error Message', detail: 'Validation failed' });
  }

  showSuccessViaMessages() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Success Message', detail: 'Message sent' });
  }

  confirm2(event: Event) {
    this.confirmationService.confirm({
      key: 'confirm2',
      target: event.target || new EventTarget,
      message: '¿Está seguro de realizar el abono?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Agredado', detail: 'Abono agregado' });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'El abono se cancelo' });
      }
    });
  }


  showConfirmation(abonoVenta: AbonoVenta) {
    this.abonoVentaSeleccionado = abonoVenta;
    this.showConfirmationDialog = true;
  }

  confirmAction(confirmation: boolean) {
    if (confirmation && this.abonoVentaSeleccionado) {

    }
    this.showConfirmationDialog = false;
    this.abonoVentaSeleccionado = null;
  }


  navigateToVentaList() {
    this.router.navigate(['pages/venta']);
  }

  formatCurrency(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
  ngOnInit(): void {
    this.getListAbonoVentas()
  }



  getListAbonoVentas() {
    this._abonoVentaService.getListAbonoVentas().subscribe((data: any) => {
      this.listAbonoVentas = data.listAbonoVentas;
    })
  }

  getAbonoVenta(id: number) {
    this._abonoVentaService.getAbonoVenta(id).subscribe((data: AbonoVenta) => {
      console.log(data)
      this.formAbonoVenta.setValue({
        venta: data.venta,
        fechaAbono: data.fechaAbono,
        valorAbono: data.valorAbono
      })
    })
  }

  addAbonoVenta() {
    const abonoVenta: AbonoVenta = {
      venta: this.formAbonoVenta.value.venta,
      fechaAbono: this.formAbonoVenta.value.fechaAbono,
      valorAbono: this.formAbonoVenta.value.valorAbono,
    }
    this._abonoVentaService.postAbonoVenta(abonoVenta).subscribe(() => {
      this.productDialog = false;
      this.toastr.success(`El abono fue registrado con exito`, `Abono agregado a la venta`)
      this.getListAbonoVentas();
    })

    this.productDialog = false;
  }



  openNew() {
    this.id = 0;
    this.formAbonoVenta.reset()
    this.productDialog = true;
  }


  hideDialog() {
    this.productDialog = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


  exportToExcel() {
    const data: any[] = []; // Array para almacenar los datos

    // Agregar encabezados a la matriz de datos
    const headers = [
      'Venta',
      'Fecha del Abono',
      'Valor del Abono'
    ];

    data.push(headers);

    // Agregar datos de cada fila a la matriz de datos
    this.listAbonoVentas.forEach(abonoVenta => {
      const row = [
        abonoVenta.venta,
        abonoVenta.fechaAbono,
        abonoVenta.valorAbono
      ];

      data.push(row);
    });

    // Crear un libro de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Abonos_Ventas');

    // Guardar el libro de Excel como archivo
    XLSX.writeFile(wb, 'abonosVentas.xlsx');
  }



}
