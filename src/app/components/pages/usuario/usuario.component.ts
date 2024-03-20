import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { UsuarioService } from 'src/app/services/usuario/usuario.service';
import { Usuario } from 'src/app/interfaces/usuario/usuario.interface';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import { AuthService } from 'src/app/services/login/login.service';
import { ConfirmationService, MessageService, ConfirmEventType, SelectItem } from 'primeng/api';


@Component({
  templateUrl: './usuario.component.html',
  providers: [MessageService, ConfirmationService],


})
export class UsuarioComponent implements OnInit {
  listUsuarios: Usuario[] = []
  usuario: Usuario = {}
  formUsuario: FormGroup;
  id: number = 0;
  userLogin = this._authService.getUser();
  emailLogin = this.userLogin?.email
  cedulaLogin = this.userLogin?.cedula


  valSwitch: boolean = false;
  showConfirmationDialog: boolean = false;
  usuarioSeleccionado: Usuario | null = null;
  switchState: boolean | undefined = undefined;


  estado: SelectItem[] = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];
  selectedEstado: SelectItem = { value: '' };

  productDialog: boolean = false;

  rowsPerPageOptions = [5, 10, 15];

  constructor(private fb: FormBuilder,
    private _usuarioService: UsuarioService,
    private _authService: AuthService,
    private toastr: ToastrService,
    private aRouter: ActivatedRoute,
    private confirmationService: ConfirmationService,


  ) {
    this.formUsuario = this.fb.group({
      nombre: ['', Validators.required],
      cedula: ['', Validators.required],
      email: ['', Validators.required],
      contrasena: ['',],
      estado: ['',],
    })
    this.aRouter.params.subscribe(params => {
      this.id = +params['id']; // Obtén el valor del parámetro 'id' de la URL y actualiza id
    });
  }

  ngOnInit(): void {
    this.getListUsuarios()
    const loginUser = this._authService.getUser();
  }



  //Lista de usuarios excepto con el que se inicio sesión
  getListUsuarios() {
    const currentUser = this._authService.getUser();
    if (currentUser) {
      this._usuarioService.getListUsuarios().subscribe((data: any) => {
        this.listUsuarios = data.listUsuarios.filter((usuario: any) => usuario.id !== currentUser.id);
      });
    }
  }


  getUsuario(id: number) {
    this._usuarioService.getUsuario(id).subscribe((data: Usuario) => {
      //console.log(data)
      this.formUsuario.setValue({
        nombre: data.nombre,
        cedula: data.cedula,
        email: data.email,
        contrasena: data.contrasena,
        estado: data.estado
      })
    })
  }


  addUsuario1() {
    this.formUsuario.markAllAsTouched();

    if (this.formUsuario.valid) {
      const usuario: Usuario = {
        nombre: this.formUsuario.value.nombre,
        cedula: this.formUsuario.value.cedula,
        email: this.formUsuario.value.email,
        contrasena: this.formUsuario.value.cedula
      }

      if (this.id !== 0) {
        usuario.id = this.id
        this._usuarioService.putUsuario(this.id, usuario).subscribe(() => {
          this.productDialog = false;
          this.toastr.info(`El usuario ${usuario.nombre} fue actualizado con éxito`, `Usuario actualizado`)
          this.getListUsuarios();
        })
      } else {
        this._usuarioService.postUsuario(usuario).subscribe(() => {
          this.productDialog = false;
          this.toastr.success(`El usuario ${usuario.nombre} fue registrado con éxito`, `Usuario agregado`)
          this.getListUsuarios();
        })
      }

      this.productDialog = false;
    } else {
      this.toastr.error('Por favor, complete los campos correctamente.', 'Error de validación');

    }

  }

  addUsuario() {
    // Ejecutar todas las validaciones
    this.validarCedula();
    this.validarNombre();
    this.validarEmail();
  
    // Marcar todos los campos como tocados para que se muestren los mensajes de error
    this.formUsuario.markAllAsTouched();
  
    // Verificar si todas las validaciones son válidas
    if (this.formUsuario.valid && this.camposValidos) {
      const usuario: Usuario = {
        nombre: this.formUsuario.value.nombre,
        cedula: this.formUsuario.value.cedula,
        email: this.formUsuario.value.email,
        contrasena: this.formUsuario.value.cedula
      };
  
      if (this.id !== 0) {
        // Actualizar usuario si es una edición
        usuario.id = this.id;
        this._usuarioService.putUsuario(this.id, usuario).subscribe(() => {
          this.productDialog = false;
          this.toastr.info(`El usuario ${usuario.nombre} fue actualizado con éxito.`, `Usuario actualizado`);
          this.getListUsuarios();
        });
      } else {
        // Agregar usuario si es un nuevo registro
        this._usuarioService.postUsuario(usuario).subscribe(() => {
          this.productDialog = false;
          this.toastr.success(`El usuario ${usuario.nombre} fue registrado con éxito.`, `Usuario agregado`);
          this.getListUsuarios();
        },
        error => {
          // Error al registrar usuario
          //console.error('Error al registrar usuario:', error);
          this.toastr.error('Por favor, complete los campos correctamente.', 'Error de validación');
        }
        );
      }
    } else {
      this.toastr.error('Por favor, complete los campos correctamente.', 'Error de validación');
    }
  }
  

  updatePassword(event: any) {
    const cedulaValue = event.target.value;
    this.formUsuario.patchValue({
      contrasena: cedulaValue
    });
  }

  openNew() {
    this.id = 0;
    this.formUsuario.reset()
    this.productDialog = true;
  }

  editProduct(id: number) {
    this.id = id;
    this.productDialog = true;
    this.getUsuario(id)
  }


  hideDialog() {
    this.productDialog = false;
    this.formUsuario.reset();
    this.errorMessages = { 
      cedula: '',
      nombre: '',
      email: ''
    };
    this.camposValidos = false;
  }
  

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  confirm(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;


    const message = `<div class="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
    <i class="pi pi-exclamation-circle text-6xl text-primary-500"></i>
    <p>
        ¿Está seguro de que desea
        <strong>${this.usuarioSeleccionado?.estado ? 'ACTIVAR' :
        'DESACTIVAR'}</strong> el usuario?
    </p>
    </div>`

    this.confirmationService.confirm({
      message: message,
      header: 'Confirmación',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      rejectButtonStyleClass: 'p-button-sm',
      acceptButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => {
        if (this.usuarioSeleccionado != null && this.usuarioSeleccionado.id != null) {
          this._usuarioService.putUsuario(this.usuarioSeleccionado.id, this.usuarioSeleccionado).subscribe(() => {
            if (this.usuarioSeleccionado!.estado !== undefined) {
              this.valSwitch = this.usuarioSeleccionado!.estado;
              this.toastr.success(`El usuario ${usuario.nombre} fue <strong>${usuario.estado ? 'activado' : 'desactivado'}</strong> con éxito`, `Éxito`, { enableHtml: true })
            }
          });
        }

      },
      reject: () => {
        this.getListUsuarios();
      }

    });
  }

  exportToExcel() {
    const data: any[] = []; // Array para almacenar los datos

    // Agregar encabezados a la matriz de datos
    const headers = [
      'Nombre',
      'Cédula',
      'Email',
      'Estado'
    ];

    data.push(headers);

    // Agregar datos de cada fila a la matriz de datos
    this.listUsuarios.forEach(usuario => {
      const row = [
        usuario.nombre,
        usuario.cedula,
        usuario.email,
        usuario.estado ? 'Activo' : 'Inactivo'
      ];

      data.push(row);
    });

    // Crear un libro de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

    // Guardar el libro de Excel como archivo
    XLSX.writeFile(wb, 'usuarios.xlsx');
  }



  //VALIDACIONES

  errorMessages={
    cedula:'',
    nombre:'',
    email:''
  }

  camposValidos:boolean=false;
  
  existeEmailEnLista(email: string): boolean {
    const usuarioExistente = this.listUsuarios.find(usuario => usuario.email === email);
    return usuarioExistente !== undefined;
  }
    
  existeCedulaEnLista(cedula: string): boolean {
    const usuarioExistente = this.listUsuarios.find(usuario => usuario.cedula === cedula);
    return usuarioExistente !== undefined;
  }


  validarCedula() {
    const cedulaControl = this.formUsuario.get('cedula');
  
    if (cedulaControl) {
      if (cedulaControl.value === null || cedulaControl.value.trim() === '') {
        this.errorMessages.cedula = 'El campo cédula es requerido.';
        this.camposValidos = false;
      } else if (!/^[0-9]*$/.test(cedulaControl.value)) {
        this.errorMessages.cedula = 'La cédula debe contener solo números.';
        this.camposValidos = false;
      } else if (cedulaControl.value.length < 8 || cedulaControl.value.length > 10) {
        this.errorMessages.cedula = 'La cédula debe tener entre 8 y 10 caracteres.';
        this.camposValidos = false;
      } else if (this.existeCedulaEnLista(cedulaControl.value) || this.cedulaLogin === cedulaControl.value) {
        this.errorMessages.cedula = 'La cédula ya fue registrada.';
        this.camposValidos = false;
      } else {
        this.errorMessages.cedula = '';
        this.camposValidos = true;
      }
    }
  }
  
  validarNombre() {
    const nombreControl = this.formUsuario.get('nombre');
  
    if (nombreControl) {
      if (nombreControl.value === null || nombreControl.value.trim() === '') {
        this.errorMessages.nombre = 'El campo nombre es requerido.';
        this.camposValidos = false;

      } else if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(nombreControl.value)) {
        this.errorMessages.nombre = 'El nombre debe contener solo letras.';
        this.camposValidos = false;
      } else if (nombreControl.value.length < 6) {
        this.errorMessages.nombre = 'Ingrese el nombre completo.';
        this.camposValidos = false;
      } else if (nombreControl.value.length > 100) {
        this.errorMessages.nombre = 'El nombre excede la longitud máxima permitida ';
        this.camposValidos = false;
      }  else {
        this.errorMessages.nombre = '';
        this.camposValidos = true;
      }
    }
  }

  validarEmail() {
    const emailControl = this.formUsuario.get('email');
  
    if (emailControl) {
      if (emailControl.value === null || emailControl.value.trim() === '') {
        this.errorMessages.email = 'El campo email es requerido.';
        this.camposValidos = false;

      } else if (!/^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]+@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/.test(emailControl.value)) {
        this.errorMessages.email = 'El email debe tener una estructura válida.';
        this.camposValidos = false;
      } else if (this.existeEmailEnLista(emailControl.value) || this.emailLogin === emailControl.value) {
        this.errorMessages.email = 'El email ya está en uso.';
        this.camposValidos = false;
      } else {
        this.errorMessages.email = '';
        this.camposValidos = true;
      }
    }
  }

}
