import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ProveedorService } from 'src/app/services/proveedor/proveedor.service';
import { Proveedor } from 'src/app/interfaces/proveedor/proveedor.interface';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import * as XLSX from 'xlsx';

@Component({
  templateUrl: './proveedor.component.html',
})
export class ProveedorComponent implements OnInit {

  nuevoProveedor: boolean = true;

  listProveedores: Proveedor[] = []
  proveedor: Proveedor = {}
  formProveedor: FormGroup;
  id: number = 0;

  showConfirmationDialog: boolean = false;
  proveedorSeleccionado: Proveedor | null = null;
  switchState: boolean | undefined = undefined;

  detalleProveedor: any;
  mostrarModalDetalle: boolean = false;

  tipoProveedores = [
    { label: 'Persona jurídica', value: 'Persona jurídica' },
    { label: 'Persona natural', value: 'Persona natural' }
  ];

  tipoIdentificaciones = [
    { label: 'NIT', value: 'NIT' },
    { label: 'Cédula de ciudadanía', value: 'Cédula de ciudadanía' },
    { label: 'Tarjeta de extranjería', value: 'Tarjeta de extranjería' },
    { label: 'Cedula de extranjero', value: 'Cedula de extranjero' },
    { label: 'Pasaporte', value: 'Pasaporte' },
    { label: 'Tarjeta de identidad', value: 'Tarjeta de identidad' }
  ];

  estado = [
    { label: 'Activo', value: 'true' },
    { label: 'Inactivo', value: 'false' }
  ];

  productDialog: boolean = false;

  constructor(private fb: FormBuilder,
    private _proveedorService: ProveedorService,
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private aRouter: ActivatedRoute
  ) {
    this.formProveedor = this.fb.group({
      tipoProveedor: ['', Validators.required],
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
      this.id = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getListProveedores();


  }

  getListProveedores() {
    this._proveedorService.getListProveedores().subscribe((data: any) => {
      this.listProveedores = data.listProveedores;
    })
  }

  getProveedor(id: number) {
    this._proveedorService.getProveedor(id).subscribe((data: Proveedor) => {
      this.formProveedor.setValue({
        tipoProveedor: data.tipoProveedor,
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
      });
    })
  }


  addProveedor() {
    this.formProveedor.markAllAsTouched();

    if (this.formProveedor.valid) {
      const proveedor: Proveedor = {
        tipoProveedor: this.formProveedor.value.tipoProveedor,
        tipoIdentificacion: this.formProveedor.value.tipoIdentificacion,
        numeroIdentificacion: this.formProveedor.value.numeroIdentificacion,
        razonSocial: this.formProveedor.value.razonSocial,
        nombreComercial: this.formProveedor.value.nombreComercial,
        ciudad: this.formProveedor.value.ciudad,
        direccion: this.formProveedor.value.direccion,
        contacto: this.formProveedor.value.contacto,
        telefono: this.formProveedor.value.telefono,
        correo: this.formProveedor.value.correo,
      }

      if (this.id !== 0) {
        proveedor.id = this.id
        this._proveedorService.putProveedor(this.id, proveedor).subscribe(() => {
          this.productDialog = false;
          this.toastr.info(`El proveedor ${proveedor.razonSocial} fue actualizado con exito`, `Cliente actualizado`)
          this.getListProveedores();
        })
      } else {
        this._proveedorService.postProveedor(proveedor).subscribe(() => {
          this.productDialog = false;
          this.toastr.success(`El proveedor ${proveedor.razonSocial} fue registrado con exito`, `Cliente agregado`)
          this.getListProveedores();
        })
      }

      this.productDialog = false;
    } else {
      this.toastr.error('Por favor, complete todos los campos obligatorios.', 'Error de validación');
    }
  }

  openNew() {
    this.id = 0;
    this.formProveedor.reset();

    const primeraOpcion = '';
    this.formProveedor.get('tipoProveedor')?.setValue(primeraOpcion);
    this.formProveedor.get('tipoIdentificacion')?.setValue(primeraOpcion);

    this.productDialog = true;
    this.nuevoProveedor = true;
  }

  editProduct(id: number) {
    this.id = id;
    this.formProveedor.reset();
    this.getProveedor(id);
    this.productDialog = true;
    this.nuevoProveedor = false;
  }

  hideDialog() {
    this.productDialog = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  get isNIT(): boolean {
    return this.formProveedor.get('tipoIdentificacion')?.value === 'NIT';
  }

  get isNull(): boolean {
    return this.formProveedor.get('tipoIdentificacion')?.value === '';
  }

  get isNITDetalle(): boolean {
    return this.detalleProveedor.tipoIdentificacion === 'NIT';
  }


  exportToExcel() {
    const data: any[] = []; // Array para almacenar los datos

    // Agregar encabezados a la matriz de datos
    const headers = [
      'Tipo Proveedor',
      'Tipo Identificación',
      'N° Iden  tificación',
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
    this.listProveedores.forEach(proveedor => {
      const row = [
        proveedor.tipoProveedor,
        proveedor.tipoIdentificacion,
        proveedor.numeroIdentificacion,
        proveedor.razonSocial,
        proveedor.nombreComercial,
        proveedor.ciudad,
        proveedor.direccion,
        proveedor.contacto,
        proveedor.telefono,
        proveedor.correo,
        proveedor.estado ? 'Activo' : 'Inactivo'
      ];

      data.push(row);
    });

    // Crear un libro de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');

    // Guardar el libro de Excel como archivo
    XLSX.writeFile(wb, 'Proveedores.xlsx');
  }

  async mostrarDetalleProveedor(id: number) {
    this.detalleProveedor = await this._proveedorService.getProveedor(id).toPromise();
    this.mostrarModalDetalle = true;
  }

  confirm(proveedor: Proveedor) {
    this.proveedorSeleccionado = proveedor;

    this.confirmationService.confirm({
      header: 'Confirmación',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      rejectButtonStyleClass: 'p-button-sm',
      acceptButtonStyleClass: 'p-button-outlined p-button-sm',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if (this.proveedorSeleccionado != null && this.proveedorSeleccionado.id != null) {
          this._proveedorService.putProveedor(this.proveedorSeleccionado.id, this.proveedorSeleccionado)
            .subscribe(() => {
              if (this.proveedorSeleccionado?.estado === true) {
                this.toastr.success('¡El proveedor ha sido ACTIVADO exitosamente!', 'Éxito');
              } else {
                this.toastr.warning('¡El proveedor ha sido DESACTIVADO exitosamente!', 'Éxito');
              }
            });
        }
      },
      reject: () => {
        this.getListProveedores()
      }
    });
  }




  /////  VALIDACIONES DE LOS CAMPOS DEL FORMULARIO

  validarCampo(campo: string) {
    const control = this.formProveedor.get(campo);

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
    const numeroIdentificacionControl = this.formProveedor.get('numeroIdentificacion');
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
    const numeroExistente = this.listProveedores.some(proveedor => proveedor.numeroIdentificacion === numeroIdentificacionValue);

    if (numeroExistente) {
      numeroIdentificacionControl?.setErrors({ numeroExistente: true });
    } else {
      numeroIdentificacionControl?.setErrors(null);
    }
  }

  validarCiudad() {
    const ciudadControl = this.formProveedor.get('ciudad');
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
    const contactoControl = this.formProveedor.get('contacto');
    const contactoValue = contactoControl?.value;

    // Verificar longitud mínima
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
    const correoControl = this.formProveedor.get('correo');
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
