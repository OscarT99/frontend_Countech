/*
import { Component } from '@angular/core';
import { AuthService } from '../../../services/login/login.service'; // Importa tu servicio de autenticación
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent {
    rememberMe: boolean = false;
    formLogin : FormGroup;

    constructor(
        private authService: AuthService,
        private router: Router,
        private fb : FormBuilder
    ) {
        this.formLogin = this.fb.group({
            email: ['',Validators.required],
            contrasena: ['',Validators.required] 
        })
    }

    login(): void {
        this.authService.login(this.formLogin.value.email,this.formLogin.value.contrasena)
            .subscribe(
                (response) => {
                    const { usuario, token } = response;
                    localStorage.setItem('token', token);

                    // Redirige a otra página, guarda la información del usuario, etc.
                    localStorage.setItem('user', JSON.stringify(usuario));
                    
                    // Redirigir a otra página después del inicio de sesión (por ejemplo, a la página de inicio)
                    // Reemplaza 'home' con la ruta a la página a la que deseas redirigir
                    this.router.navigate(['/pages/usuario']);
                    console.log(token);
                },
                (error) => {
                    console.error('Error al iniciar sesión:', error);
                    if (error.error && error.error.msg) {
                        // Muestra el mensaje de error recibido del backend
                        console.error('Mensaje de error:', error.error.msg);
                    } else {
                        console.error('Error desconocido:', error);
                    }
                }
            );
    }


    olvidoContrasena(): void {
        this.router.navigateByUrl('..\olvido-contrasena\olvido-contrasena.component.html');
    }
}
*/
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
})
export class LoginComponent {
    formLogin: FormGroup;

    constructor(
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private modalService: BsModalService,
        public bsModalRef: BsModalRef,
        private toastr : ToastrService,


    ) {
        this.formLogin = this.fb.group({
            email: ['', Validators.required],
            contrasena: ['', Validators.required] 
        });
    }

   
  
    user:any={
      email:'',
      contrsena:'',
   
    }
  
    errorMessages={
      email:'',
      contrasena:'',
      credenciales:'',
      recuperar:''
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
                },
                (error) => {
                    console.error('Error al iniciar sesión:', error);
                    if (error.error && error.error.msg) {
                        // Muestra el mensaje de error recibido del backend
                        console.error('Mensaje de error:', error.error.msg);
                    } else {
                        console.error('Error desconocido:', error);
                    }
                }
            );
    }

    //RECUPERAR CONTRASEÑA
    validarContrasena(){
        const validacion = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
        const contrasena = (document.getElementById('contrasena') as HTMLInputElement).value;
   
        if(!contrasena){
         this.errorMessages.contrasena=''
        }
        else if(!validacion.test(contrasena)){
         this.errorMessages.contrasena='Minimo 8 caracteres, 1 mayuscula y un simbolo.';
        }
        else{
         this.errorMessages.contrasena=''
        }
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
    this.bsModalRef= this.modalService.show(RecuperarComponent,{ 
      backdrop:'static',
      keyboard:false
     });
   }

}
