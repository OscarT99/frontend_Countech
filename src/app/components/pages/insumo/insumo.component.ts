import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { InsumoService } from 'src/app/services/insumo/insumo.service';
import { InsumoInstance } from 'src/app/interfaces/insumo/insumo.interface';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ConfirmationService } from 'primeng/api';
import { SalidaInsumoInstance } from 'src/app/interfaces/insumo/salidaInsumo.interface';
import { SalidaInsumoService } from 'src/app/services/insumo/salidaInsumo.service';

@Component({
  templateUrl: './insumo.component.html',

})
export class InsumoComponent implements OnInit {

  nuevoInsumo: boolean = true;
  mostrarID: boolean = false;

  tipoMaquina: any[] = [
    { label: 'Fileteadora', value: 'Fileteadora' },
    { label: 'Plana', value: 'Plana' },
    { label: 'Presilladora', value: 'Presilladora' },
    { label: 'Recubridora', value: 'Recubridora' },
    { label: 'Manual', value: 'Manual' }
  ];

  listInsumosGastados: SalidaInsumoInstance[] = []
  sugerenciasInsumos: InsumoInstance[] = [];

  showConfirmationSalidaInsumo: boolean = false;
  showConfirmationDialogInsumo: boolean = false;
  insumoSeleccionado: InsumoInstance | null = null;

  valSwitch: boolean = false;

  idInsumo: number = 0;
  formInsumo: FormGroup;
  formSalidaInsumo: FormGroup;

  listInsumos: InsumoInstance[] = []

  modalCrearInsumo: boolean = false;
  modalSalidaInsumo: boolean = false;

  constructor(private fb: FormBuilder,
    private _insumoService: InsumoService,
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private _salidaInsumoService: SalidaInsumoService
  ) {
    this.formInsumo = this.fb.group({
      nombre: ['', Validators.required],
      cantidad: [0]
    }),
      this.formSalidaInsumo = this.fb.group({
        insumo: ['', Validators.required],
        insumoNombre: ['', Validators.required],
        cantidad: [0, Validators.required],
        cantidadExistente: [0, Validators.required],
        tipoDeMaquina: ['', Validators.required]
      })
  }

  ngOnInit(): void {
    this.getListInsumos();
    this.obtenerListaInsumos();
  }

  getListInsumos() {
    this._insumoService.getListInsumos().subscribe((data: any) => {
      this.listInsumos = data.listInsumos
    })
  }

  openNewInsumo() {
    this.idInsumo = 0;
    this.formInsumo.reset();
    this.modalCrearInsumo = true;
    this.nuevoInsumo = true;
  }

  editInsumo(id: number) {
    this.idInsumo = id;
    this.modalCrearInsumo = true;
    this.getInsumo(id);
    this.nuevoInsumo = false;
  }

  openSalidaInsumo() {
    this.idInsumo = 0;
    this.modalSalidaInsumo = true;
    this.formSalidaInsumo.reset();
    this.listInsumosGastados = [];
    const primeraOpcion = '';
    this.formSalidaInsumo.get('tipoDeMaquina')?.setValue(primeraOpcion);
  }

  addInsumo() {
    this.formInsumo.markAllAsTouched();

    if (this.formInsumo.valid) {
      const insumo: InsumoInstance = {
        nombre: this.formInsumo.value.nombre,
        cantidad: this.formInsumo.value.cantidad
      };

      if (this.idInsumo !== 0) {
        insumo.id = this.idInsumo;
        this._insumoService.putInsumo(this.idInsumo, insumo).subscribe(() => {
          this.modalCrearInsumo = false;
          this.toastr.info(
            `El insumo ${insumo.nombre} fue actualizado con éxito`,
            `Insumo actualizado`
          );
          this.getListInsumos();
        });
      } else {
        this._insumoService.postInsumo(insumo).subscribe(() => {
          this.modalCrearInsumo = false;
          this.toastr.success(
            `El insumo ${insumo.nombre} fue registrado con éxito`,
            `Insumo agregado`
          );
          this.getListInsumos();
        });
      }

      this.modalCrearInsumo = false;
    } else {
      this.toastr.error(
        'Por favor, complete todos los campos obligatorios.',
        'Error de validación'
      );
    }
  }

  getInsumo(id: number) {
    this._insumoService.getInsumo(id).subscribe((data: InsumoInstance) => {
      this.formInsumo.setValue({
        nombre: data.nombre,
        cantidad: data.cantidad
      });
    });
  }

  confirm(insumo: InsumoInstance) {
    this.insumoSeleccionado = insumo;

    this.confirmationService.confirm({
      header: 'Confirmación',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      rejectButtonStyleClass: 'p-button-sm',
      acceptButtonStyleClass: 'p-button-outlined p-button-sm',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if (this.insumoSeleccionado != null && this.insumoSeleccionado.id != null) {
          this._insumoService.putInsumo(this.insumoSeleccionado.id, this.insumoSeleccionado)
            .subscribe(() => {
              if (this.insumoSeleccionado?.estado === true) {
                this.toastr.success('¡El insumo ha sido ACTIVADO exitosamente!', 'Éxito');
              } else {
                this.toastr.warning('¡El insumo ha sido DESACTIVADO exitosamente!', 'Éxito');
              }
            });
        }
      },
      reject: () => {
        this.getListInsumos();
      }
    });
  }

  obtenerListaInsumos(): void {
    this._insumoService.getListInsumosCompra().subscribe(
      (data: { listInsumos: InsumoInstance[] }) => {
        this.sugerenciasInsumos = data.listInsumos.filter(insumo => insumo.estado);;
      });
  }

  buscarInsumos(event: any): void {
    if (!event.query) {
      this.obtenerListaInsumos();
    }
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
    const insumoNombre = event.value.nombre
    const cantidadExistente = event.value.cantidad

    this.formSalidaInsumo.get('insumo')!.setValue(insumoId);
    this.formSalidaInsumo.get('insumoNombre')!.setValue(insumoNombre);
    this.formSalidaInsumo.get('cantidadExistente')!.setValue(cantidadExistente);
  }

  realizarBusquedaEnTiempoRealInsumo(event: any): void {
    const query = event.target.value;
    this.obtenerListaInsumos(); // Obtener la lista completa de clientes
    this.sugerenciasInsumos = this.filterInsumos(query);
  }

  addInsumoGastado() {
    this.formSalidaInsumo.markAllAsTouched();

    if (this.formSalidaInsumo.valid) {
      const insumoId = this.formSalidaInsumo.value.insumo;
      const cantidadIngresada = this.formSalidaInsumo.value.cantidad;
      const tipoDeMaquina = this.formSalidaInsumo.value.tipoDeMaquina;

      const insumoExistente = this.listInsumosGastados.find((insumo) => insumo.insumo === insumoId && insumo.tipoDeMaquina === tipoDeMaquina);

      if (insumoExistente) {
        this.toastr.warning('Este insumo y tipo de maquina ya se encuentran en la lista.', 'Error');
      } else {
        const salidaInsumo: SalidaInsumoInstance = {
          insumo: insumoId,
          insumoNombre: this.formSalidaInsumo.value.insumoNombre,
          cantidad: cantidadIngresada,
          tipoDeMaquina: tipoDeMaquina,
        };

        this.listInsumosGastados.push(salidaInsumo);

        this.formSalidaInsumo.reset({
          ...this.formSalidaInsumo.value,
          insumo: '',
          insumoNombre: '',
          cantidad: 0,
          cantidadExistente: null,
          tipoDeMaquina: '',
        });
      }
    } else {
      this.toastr.error(
        'Por favor, complete todos los campos obligatorios.',
        'Error de validación'
      );
    }
  }

  validarCantidad() {
    const insumoId = this.formSalidaInsumo.value.insumo;
    const cantidadIngresada = this.formSalidaInsumo.value.cantidad;

    // Encuentra el insumo seleccionado en la lista completa
    const insumoSeleccionado = this.listInsumos.find((insumo) => insumo.id === insumoId);

    if (insumoSeleccionado) {
      const sumatoriaCantidad = this.listInsumosGastados
        .filter((item) => item.insumo === insumoId)
        .reduce((total, item) => total + item.cantidad!, 0);

      if (sumatoriaCantidad + cantidadIngresada > insumoSeleccionado.cantidad!) {
        this.formSalidaInsumo.get('cantidad')?.setErrors({ cantidadExcedida: true });
      } else {
        this.formSalidaInsumo.get('cantidad')?.setErrors(null);
      }
    } else {
      // Mostrar error si no se encuentra el insumo seleccionado
      this.toastr.error('No se encontró el insumo seleccionado.', 'Error');
    }
  }


  eliminarInsumoGastado(insumoGastado: SalidaInsumoInstance): void {
    const index = this.listInsumosGastados.indexOf(insumoGastado);

    if (index !== -1) {
      this.listInsumosGastados.splice(index, 1);
    } else {
      this.toastr.warning('No se encontró el insumo en la lista.');
    }
  }


  confirmActionSalidaInsumo(aceptar: boolean): void {
    if (aceptar) {
      this.postSalidaRecursivo(0); // Llamamos al primer elemento de la lista
    } else {
      this.showConfirmationSalidaInsumo = false;
    }
  }

  private postSalidaRecursivo(index: number): void {
    if (index < this.listInsumosGastados.length) {
      const salidaInsumo = this.listInsumosGastados[index];

      this._salidaInsumoService.postSalidaInsumo(salidaInsumo).subscribe(() => {
        this._insumoService.restarCantidadInsumo(salidaInsumo.insumo!, salidaInsumo.cantidad!)
          .subscribe(() => {
            this.getListInsumos();
            this.postSalidaRecursivo(index + 1); // Llamamos al siguiente elemento en la lista
          });
      });
    } else {
      // Cuando hemos procesado todos los elementos, limpiamos y mostramos el mensaje de éxito
      this.formSalidaInsumo.reset();
      this.listInsumosGastados = [];
      this.showConfirmationSalidaInsumo = false;
      this.modalSalidaInsumo = false;
      this.toastr.success(`La salida de los insumos fue registrada con éxito`, `Salida insumo registrada`);
    }
  }

  confirmarSalidaInsumo() {
    if (this.listInsumosGastados.length < 1) {
      this.formSalidaInsumo.markAllAsTouched();
      this.toastr.error(
        'Debes de agregar por lo menos un insumo.',
        'Error de validación'
      );
      return
    }

    this.showConfirmationSalidaInsumo = true
  }

  exportToExcel() {

    const data: any[] = []

    const headers = [
      'Insumo',
      'Cantidad',
      'Estado'
    ];

    data.push(headers)

    this.listInsumos.forEach(insumo => {
      const row = [
        insumo.nombre,
        { t: 'n', v: insumo.cantidad },
        insumo.estado ? 'Activo' : 'Inactivo'
      ];

      data.push(row)
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Insumos');

    XLSX.writeFile(wb, 'insumos.xlsx')
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


  cerrarModalSalidaInsumo() {
    this.modalSalidaInsumo = false;
    this.listInsumosGastados = [];
  }


  // Verificar la existencia en la base de datos

  validarNombreInsumo() {
    const insumoControl = this.formInsumo.get('nombre');
    const insumoValue = insumoControl?.value;
    const minCaracteres = 3;


    // Verificar si es requerido
    if (insumoControl?.hasError('required')) {
      return;
    }

    if (insumoValue && insumoValue.length < minCaracteres) {
      insumoControl?.setErrors({ minlength: true });
      return
    } else {
      insumoControl?.setErrors(null);
    }

    // Verificar la existencia en la base de datos
    const insumoExistente = this.listInsumos.some(insumo => insumo.nombre === insumoValue);

    if (insumoExistente) {
      insumoControl?.setErrors({ insumoExistente: true });
    } else {
      insumoControl?.setErrors(null);
    }
  }

  validacionExistenteNombre() {
    const nombreInsumo = this.formSalidaInsumo.value.insumoNombre

    const insumoExistente = this.listInsumos.some((insumo) => insumo.nombre === nombreInsumo);

    if (insumoExistente == false) {
      this.formSalidaInsumo.get('insumoNombre')!.setValue('')
    }

  }

}      
