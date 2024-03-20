import { NgForm } from '@angular/forms';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../services/login/login.service'; // Importa tu servicio de autenticación
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RecuperarComponent } from '../recuperar/recuperar.component';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    //styleUrls: ['_login.scss']

})
export class LoginComponent {
    formLogin: FormGroup;
    productDialog: boolean = false;


    constructor(
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private modalService: BsModalService,
        public bsModalRef: BsModalRef,
        private toastr: ToastrService,


    ) {
        this.formLogin = this.fb.group({
            email: ['', Validators.required],
            contrasena: ['', Validators.required]
        });
    }



    user: any = {
        email: '',
        contrsena: '',

    }



    login(): void {
        const { email, contrasena } = this.formLogin.value;
        this.authService.login(email, contrasena)
            .subscribe(
                (response: any) => {
                    const { usuario, token, msg } = response;
                    localStorage.setItem('token', token);

                    // Redirige a otra página, guarda la información del usuario, etc.
                    localStorage.setItem('user', JSON.stringify(usuario));

                    // Redirigir a otra página después del inicio de sesión (por ejemplo, a la página de inicio)
                    // Reemplaza 'home' con la ruta a la página a la que deseas redirigir
                    this.router.navigate(['/pages/usuario']);
                    //console.log(msg);
                    const primerNombre = usuario.nombre.split(' ')[0];
                    this.toastr.success('Inicio de sesión exitoso.', `¡Bienvenid@ ${primerNombre}!`);
                },
                (error) => {
                    //console.error('Error al iniciar sesión:', error);
                    if (this.errorMessages.email || this.errorMessages.contrasena || this.formLogin.get('email')?.value === '' || this.formLogin.get('contrasena')?.value === '') {
                        this.toastr.error('Complete los campos correctamente', 'Error de validación');
                    } else if (error.error.msg === 'El usuario no se encuentra activo') {
                        this.toastr.error('Acceso denegado, contactese con el administrador para más información.', 'Usuario inactivo');

                    } else if (error.status === 400) {
                        this.toastr.error('Credenciales inválidas', 'Error de validación');
                    }
                }
            );
    }


    //VALIDACIONES

    errorMessages = {
        email: '',
        contrasena: '',
        credenciales: '',
        recuperar: ''
    }

    camposValidos: boolean = false;


    validarContrasena() {
        const contrasena = this.formLogin.get('contrasena');
        if (contrasena) {
            if (contrasena.value === null || contrasena.value.trim() === '' || !contrasena) {
                this.errorMessages.contrasena = 'La contraseña es requerida.';
                this.camposValidos = false;

            } else {
                this.errorMessages.contrasena = ''
                this.camposValidos = true;
            }
        }
    }

    validarEmail() {
        const emailControl = this.formLogin.get('email');

        if (emailControl) {
            if (emailControl.value === null || emailControl.value.trim() === '') {
                this.errorMessages.email = 'El campo email es requerido.';
                this.camposValidos = false;

            } else if (!/^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]+@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/.test(emailControl.value)) {
                this.errorMessages.email = 'El email debe tener una estructura válida.';
                this.camposValidos = false;
            } else {
                this.errorMessages.email = '';
                this.camposValidos = true;
            }
        }
    }




    //RECUPERAR CONTRASEÑA
    openNew() {
        this.productDialog = true;
    }

    email: string | undefined;
    contrasena: string | undefined;


    errorMessages1 = {
        email: '',
        contrasena: '',
        credenciales: '',
        recuperar: ''
    }

    loading: boolean = false;
    emailValido: boolean = false;


    emailCompleto(): boolean {
        return (
            !!this.user.email
        )
    }

    validaremail() {
        const validacionemail = /^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]+@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/;
        if (!this.user.email || !this.user.email.trim()) {
            this.errorMessages1.recuperar = 'El email es necesario para recuperar la contraseña';
            this.emailValido = false;
        } else if (!validacionemail.test(this.user.email)) {
            this.errorMessages1.recuperar = 'El email debe tener una estructura válida (usuario@dominio.com).';
            this.emailValido = false;
        } else if (this.user.email.length > 100) {
            this.errorMessages1.recuperar = 'El email no debe superar los 100 caracteres.';
            this.emailValido = false;
        } else {
            this.errorMessages1.recuperar = '';
            this.emailValido = true;
        }
    }



    mensajeColor: string | undefined;



    forgotPassword(form: NgForm) {
        // Obtener el valor del campo de email del formulario
        const email = form.value.email;

        // Cambiar el estado de loading antes de llamar al servicio
        //this.loading = true;

        // Llamar al servicio para solicitar el restablecimiento de contraseña
        this.authService.forgotPassword({ email }).subscribe(
            (response) => {
                if (response.message) {
                    this.toastr.info('Se ha enviado un enlace  por email para restablecer la contraseña.', `Recuperación contraseña`);
                    setTimeout(() => {
                        this.hideDialog(); // Cierra el modal
                    }, 3000);
                }
            },
            (error) => {
                if (error.error && error.error.error) {
                    this.errorMessages1.recuperar = error.error.error;
                    // Establecer el color del mensaje como rojo si hay un error
                    if (error.error.error === 'El usuario no esta registrado') {
                        this.mensajeColor = 'red';
                        // Establecer un temporizador para borrar el mensaje después de 2 segundos
                        setTimeout(() => {
                            this.errorMessages1.recuperar = '';
                            this.mensajeColor = ''; // Restablecer el color
                        }, 2000);
                    } else {
                        // Dejar el color predeterminado si no es un error específico relacionado con el email
                        if (error.error.error !== 'El usuario no esta registrado.') {
                            this.errorMessages1.recuperar = ''; // Borrar cualquier mensaje de error relacionado con el email
                        }
                        this.mensajeColor = ''; // Restablecer el color
                    }
                }
            }
        );
    }




    cerrarModal1() {
        setTimeout(() => {
            this.bsModalRef.hide();  // Cierra el modal
            this.router.navigate(['/auht/login']);
        }, 2000); // 2000 milisegundos = 2 segundos
    }


    cerrarModal(): void {
        this.bsModalRef.hide();  // Cierra el modal
        this.router.navigate(['/auth/login']);
    }


    hideDialog() {
        this.productDialog = false;
        this.errorMessages1 = {
            email: '',
            contrasena: '',
            credenciales: '',
            recuperar: ''
        }

        this.emailValido = false;
    }




}
