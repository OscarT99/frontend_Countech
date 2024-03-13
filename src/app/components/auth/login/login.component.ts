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
                    console.log(msg);
                    const primerNombre = usuario.nombre.split(' ')[0];
                    this.toastr.success('Inicio de sesión exitoso.', `¡Bienvenid@ ${primerNombre}!`);
                },
                (error) => {
                    console.error('Error al iniciar sesión:', error);
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






    forgotPassword(form: NgForm) {
        // Obtener el valor del campo de correo del formulario
        const correo = form.value.correo;
        console.log(correo)

        // Llamar al servicio para solicitar el restablecimiento de contraseña
        this.authService.forgotPassword({ correo }).subscribe(
            (response) => {
                console.log('Respuesta del servidor para recuperar contraseña:', response);
                if (response.message) {
                    // Asignar el mensaje de éxito a una propiedad en tu componente
                    this.errorMessages.recuperar = response.message;

                    // Establecer un temporizador para borrar el mensaje después de 2 segundos
                    setTimeout(() => {
                        this.errorMessages.recuperar = '';

                        // Cerrar el modal después de 2 segundos
                        setTimeout(() => {
                            this.cerrarModal();
                        }, 2000);
                    }, 2000);
                }

            },
            (error) => {
                console.error('Error en la solicitud para recuperar contraseña:', error);
                if (error.error && error.error.error) {
                    this.errorMessages.recuperar = error.error.error;
                    setTimeout(() => {
                        this.errorMessages.recuperar = '';
                    }, 2000);
                }
            }
        );
    }




    cerrarModal(): void {
        this.bsModalRef.hide();  // Cierra el modal
        this.router.navigate(['/login']);
    }



    abrirRecuperar() {
        this.bsModalRef = this.modalService.show(RecuperarComponent, {
            backdrop: 'static',
            keyboard: false
        });
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
        if(contrasena){
            if (contrasena.value === null || contrasena.value.trim() === '' || !contrasena) {
                this.errorMessages.contrasena = 'La contraseña es requerida.';
                this.camposValidos = false;

            }else {
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
            }  else {
                this.errorMessages.email = '';
                this.camposValidos = true;
            }
        }
    }

}
