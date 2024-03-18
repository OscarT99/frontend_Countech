import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { Cliente } from 'src/app/interfaces/cliente/cliente.interface';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import { ConfirmationService } from 'primeng/api';

@Component({
  templateUrl: './cliente.component.html',

})
export class ClienteComponent implements OnInit {

  tipoCliente: any;
  nuevoCliente: boolean = true;

  listClientes: Cliente[] = []
  cliente: Cliente = {}
  formCliente: FormGroup;
  id: number = 0;

  valSwitch: boolean = false;
  showConfirmationDialog: boolean = false;
  clienteSeleccionado: Cliente | null = null;
  switchState: boolean | undefined = undefined;

  detalleCliente: any;
  mostrarModalDetalle: boolean = false;

  tiposDeCliente = [
    { label: 'Persona jurídica', value: 'Persona jurídica' },
    { label: 'Persona natural', value: 'Persona natural' }
  ];


  tipoIdentificaciones = [
    { label: 'NIT', value: 'NIT' },
    { label: 'Cédula de ciudadanía', value: 'Cédula de ciudadanía' },
    { label: 'Tarjeta de extranjería', value: 'Tarjeta de extranjería' },
    { label: 'Cedula de extranjero', value: 'Cédula de extranjería' },
    { label: 'Pasaporte', value: 'Pasaporte' },
    { label: 'Tarjeta de identidad', value: 'Tarjeta de identidad' },
  ];

  estados = [
    { label: 'Activo', value: 'true' },
    { label: 'Inactivo', value: 'false' }
  ];

  productDialog: boolean = false;

  mostrarAsteriscoRojo: boolean = true;

  constructor(private fb: FormBuilder,
    private _clienteService: ClienteService,
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private aRouter: ActivatedRoute,
  ) {
    this.formCliente = this.fb.group({
      tipoCliente: ['', Validators.required],
      tipoIdentificacion: ['', Validators.required],
      numeroIdentificacion: ['', Validators.required],
      razonSocial: ['', Validators.required],
      nombreComercial: ['', Validators.required],
      ciudad: ['', Validators.required],
      direccion: ['',],
      contacto: ['',],
      telefono: ['',],
      correo: ['',],
      estado: [],
    })
    this.aRouter.params.subscribe(params => {
      this.id = +params['id']; // Obtén el valor del parámetro 'id' de la URL y actualiza id
    });
  }

  ngOnInit(): void {
    this.getListClientes()
  }

  getListClientes() {
    this._clienteService.getListClientes().subscribe((data: any) => {
      this.listClientes = data.listClientes;
    })
  }

  getCliente(id: number) {
    this._clienteService.getCliente(id).subscribe((data: Cliente) => {
      this.formCliente.setValue({
        tipoCliente: data.tipoCliente,
        tipoIdentificacion: data.tipoIdentificacion,
        numeroIdentificacion: data.numeroIdentificacion,
        razonSocial: data.razonSocial,
        nombreComercial: data.nombreComercial,
        ciudad: data.ciudad,
        direccion: data.direccion,
        contacto: data.contacto,
        telefono: data.telefono,
        correo: data.correo,
        estado: data.estado
      })
    })
  }

  addCliente() {
    this.formCliente.markAllAsTouched();

    if (this.formCliente.valid) {

      // Resto del código para agregar o actualizar el cliente
      const cliente: Cliente = {
        tipoCliente: this.formCliente.value.tipoCliente,
        tipoIdentificacion: this.formCliente.value.tipoIdentificacion,
        numeroIdentificacion: this.formCliente.value.numeroIdentificacion,
        razonSocial: this.formCliente.value.razonSocial,
        nombreComercial: this.formCliente.value.nombreComercial,
        ciudad: this.formCliente.value.ciudad,
        direccion: this.formCliente.value.direccion,
        contacto: this.formCliente.value.contacto,
        telefono: this.formCliente.value.telefono,
        correo: this.formCliente.value.correo,
      };

      if (this.id !== 0) {
        cliente.id = this.id;
        this._clienteService.putCliente(this.id, cliente).subscribe(() => {
          this.productDialog = false;
          this.toastr.info(`El cliente ${cliente.razonSocial} fue actualizado con éxito`, `Cliente actualizado`);
          this.getListClientes();
        });
      } else {
        this._clienteService.postCliente(cliente).subscribe(() => {
          this.productDialog = false;
          this.toastr.success(`El cliente ${cliente.razonSocial} fue creado con éxito`, `Cliente creado`);
          this.getListClientes();
        });
      }

      this.productDialog = false;
    } else {
      this.toastr.error('Por favor, complete todos los campos obligatorios.', 'Error de validación');
    }
  }

  openNew() {
    this.id = 0;
    this.formCliente.reset();

    const primeraOpcion = '';
    this.formCliente.get('tipoCliente')?.setValue(primeraOpcion);
    this.formCliente.get('tipoIdentificacion')?.setValue(primeraOpcion);

    this.productDialog = true;
    this.nuevoCliente = true;
  }

  editProduct(id: number) {
    this.id = id;
    this.productDialog = true;
    this.getCliente(id)
    this.nuevoCliente = false;
  }

  hideDialog() {
    this.productDialog = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  confirm(cliente: Cliente) {
    this.clienteSeleccionado = cliente;

    this.confirmationService.confirm({
      header: 'Confirmación',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      rejectButtonStyleClass: 'p-button-sm',
      acceptButtonStyleClass: 'p-button-outlined p-button-sm',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if (this.clienteSeleccionado != null && this.clienteSeleccionado.id != null) {
          this._clienteService.putCliente(this.clienteSeleccionado.id, this.clienteSeleccionado)
            .subscribe(() => {
              if (this.clienteSeleccionado?.estado === true) {
                this.toastr.success('¡El cliente ha sido ACTIVADO exitosamente!', 'Éxito');
              } else {
                this.toastr.warning('¡El cliente ha sido DESACTIVADO exitosamente!', 'Éxito');
              }
            });
        }
      },
      reject: () => {
        this.getListClientes()
      }
    });
  }

  get isNIT(): boolean {
    return this.formCliente.get('tipoIdentificacion')?.value === 'NIT';
  }

  get isNull(): boolean {
    return this.formCliente.get('tipoIdentificacion')?.value === '';
  }

  get isNITDetalle(): boolean {
    return this.detalleCliente.tipoIdentificacion === 'NIT';
  }

  exportToExcel() {
    const data: any[] = []; // Array para almacenar los datos

    // Agregar encabezados a la matriz de datos
    const headers = [
      'Tipo Cliente',
      'Tipo Identificación',
      'N° Identificación',
      'Razon Social',
      'Nombre Comercial',
      'Ciudad',
      'Dirección',
      'Contacto',
      'Telefono',
      'Email',
      'Estado'
    ];

    data.push(headers);

    // Agregar datos de cada fila a la matriz de datos
    this.listClientes.forEach(cliente => {
      const row = [
        cliente.tipoCliente,
        cliente.tipoIdentificacion,
        cliente.numeroIdentificacion,
        cliente.razonSocial,
        cliente.nombreComercial,
        cliente.ciudad,
        cliente.direccion,
        cliente.contacto,
        cliente.telefono,
        cliente.correo,
        cliente.estado ? 'Activo' : 'Inactivo'
      ];

      data.push(row);
    });

    // Crear un libro de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

    // Guardar el libro de Excel como archivo
    XLSX.writeFile(wb, 'clientes.xlsx');
  }

  async mostrarDetalleCliente(id: number) {
    this.detalleCliente = await this._clienteService.getCliente(id).toPromise();
    this.mostrarModalDetalle = true;
  }

  /////  VALIDACIONES DE LOS CAMPOS DEL FORMULARIO

  validarCampo(campo: string) {
    const control = this.formCliente.get(campo);

    if (control?.hasError('required')) {
      return;
    }

    if (campo === 'razonSocial' || campo === 'nombreComercial') {
      const minCaracteresRegex = /^.{3,}$/;

      if (!minCaracteresRegex.test(control?.value)) {
        control?.setErrors({ minlength: true });
      } else {
        control?.setErrors(null);
      }
    } else {
      const soloLetrasRegex = /^[a-zA-ZáéíóúüÁÉÍÓÚÜÑñ\s.]*$/;
      if (!soloLetrasRegex.test(control?.value)) {
        control?.setErrors({ soloLetras: true });
      } else {
        control?.setErrors(null);
      }
    }
  }

  validarNumeroIdentificacion() {
    const numeroIdentificacionControl = this.formCliente.get('numeroIdentificacion');
    const numeroIdentificacionValue = numeroIdentificacionControl?.value;

    // Verificar si se ingresan letras}
    if (!/^\d+$/.test(numeroIdentificacionValue)) {
      numeroIdentificacionControl?.setErrors({ soloNumeros: true });
      return;
    }

    // Verificar la longitud mínima
    if (numeroIdentificacionValue && numeroIdentificacionValue < 100000) {
      numeroIdentificacionControl?.setErrors({ minlength: true });
      return;
    }

    // Verificar la existencia en la base de datos
    const numeroExistente = this.listClientes.some(cliente => cliente.numeroIdentificacion === numeroIdentificacionValue);

    if (numeroExistente) {
      numeroIdentificacionControl?.setErrors({ numeroExistente: true });
    } else {
      numeroIdentificacionControl?.setErrors(null);
    }
  }

  validarCiudad() {
    const ciudadControl = this.formCliente.get('ciudad');
    const ciudadValue = ciudadControl?.value;

    // Verificar si es requerido
    if (ciudadControl?.hasError('required')) {
      return;
    }

    // Verificar solo letras y longitud mínima
    const soloLetrasRegex = /^[a-zA-ZáéíóúüÁÉÍÓÚÜÑñ\s]*$/;
    const minCaracteres = 4;

    if (!soloLetrasRegex.test(ciudadValue)) {
      ciudadControl?.setErrors({ soloLetras: true });
    } else if (ciudadValue && ciudadValue.length < minCaracteres) {
      ciudadControl?.setErrors({ minlength: true });
    } else {
      ciudadControl?.setErrors(null);
    }
  }

  validarContacto() {
    const contactoControl = this.formCliente.get('contacto');
    const contactoValue = contactoControl?.value;
    const minCaracteres = 3;

    if (contactoControl?.hasError('required')) {
      return;
    }

    if (contactoValue && contactoValue.length < minCaracteres) {
      contactoControl?.setErrors({ minlength: true });
    } else {
      contactoControl?.setErrors(null);
    }
  }

  validarCorreo() {
    const correoControl = this.formCliente.get('correo');
    const correoValue = correoControl?.value;

    // Verificar si es un correo válido
    const correoValidoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!correoValidoRegex.test(correoValue)) {
      correoControl?.setErrors({ correoInvalido: true });
    } else {
      correoControl?.setErrors(null);
    }
  }
}
