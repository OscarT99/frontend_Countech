import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { Cliente } from 'src/app/interfaces/cliente/cliente.interface';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  templateUrl: './cliente.component.html',

})
export class ClienteComponent implements OnInit {
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
    { label: 'Empresa', value: 'Empresa' },
    { label: 'Persona', value: 'Persona' }
  ];

  tipoIdentificacion = [
    { label: 'NIT', value: 'NIT' },
    { label: 'Cédula de ciudadanía', value: 'Cédula de ciudadanía' },
    { label: 'Registro civil', value: 'Registro civil' },
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

  rowsPerPageOptions = [5, 10, 15];

  constructor(private fb: FormBuilder,
    private _clienteService: ClienteService,
    private toastr: ToastrService,
    private aRouter: ActivatedRoute,
  ) {
    this.formCliente = this.fb.group({
      tipoCliente: [undefined, Validators.required],
      tipoIdentificacion: [undefined, Validators.required],
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
      console.log(data)
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
    this.formCliente.reset()
    this.productDialog = true;
  }

  editProduct(id: number) {
    this.id = id;
    this.productDialog = true;
    this.getCliente(id)
  }

  hideDialog() {
    this.productDialog = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  showConfirmation(cliente: Cliente) {
    this.switchState = cliente.estado;
    this.clienteSeleccionado = cliente;
    this.showConfirmationDialog = true;
  }

  confirmAction(confirmation: boolean) {
    if (confirmation && this.clienteSeleccionado) {
      if (this.clienteSeleccionado.id) {
        console.log(this.clienteSeleccionado)
        this._clienteService.putCliente(this.clienteSeleccionado.id, this.clienteSeleccionado).subscribe(() => {
          if (this.clienteSeleccionado!.estado !== undefined) {
            this.valSwitch = this.clienteSeleccionado!.estado;
          }
        });
      }
    }
    this.showConfirmationDialog = false;
    this.clienteSeleccionado = null;
  }


  get isNIT(): boolean {
    return this.formCliente.get('tipoIdentificacion')?.value === 'NIT';
  }

  get isNITDetalle(): boolean {
    return this.detalleCliente.tipoIdentificacion === 'NIT';
  }

  exportToExcel() {
    const data: any[] = []; // Array para almacenar los datos

    // Agregar encabezados a la matriz de datos
    const headers = [
      'Tipo',
      'N° Identificación',
      'Razon Social',
      'Telefono',
      'Email',
      'Estado'
    ];

    data.push(headers);

    // Agregar datos de cada fila a la matriz de datos
    this.listClientes.forEach(cliente => {
      const row = [
        cliente.tipoCliente,
        cliente.numeroIdentificacion,
        cliente.razonSocial,
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
    try {
      this.detalleCliente = await this._clienteService.getCliente(id).toPromise();
      this.mostrarModalDetalle = true;
    } catch (error) {
      console.error('Error al obtener el detalle del cliente:', error);
    }
  }

  /////  VALIDACIONES DE LOS CAMPOS DEL FORMULARIO
validarCampo(campo: string) {
  const control = this.formCliente.get(campo);
  const valor = control?.value;

  if (control?.hasError('required')) {
      return;
  }

  // Validar solo letras en el campo
  if (!/^[a-zA-ZáéíóúüÁÉÍÓÚÜ\s]*$/.test(valor)) {
    control?.setErrors({ soloLetras: true });
} else {
    control?.setErrors(null);
}

}

validarNumeroIdentificacion() {
  const numeroIdentificacionControl = this.formCliente.get('numeroIdentificacion');
  const numeroIdentificacionValue = numeroIdentificacionControl?.value;

  // Verificar si el número de identificación tiene al menos 6 dígitos
  if (numeroIdentificacionValue && numeroIdentificacionValue.length < 6) {
      numeroIdentificacionControl?.setErrors({ minlength: true });
      return;
  }

  // Verificar si el número de identificación ya existe en la base de datos
  const numeroExistente = this.listClientes.some(cliente => cliente.numeroIdentificacion === numeroIdentificacionValue);
  if (numeroExistente) {
      numeroIdentificacionControl?.setErrors({ numeroExistente: true });
  } else {
      numeroIdentificacionControl?.setErrors(null);
  }
}

}
