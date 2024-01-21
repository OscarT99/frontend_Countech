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
                    this.router.navigate(['/pages/venta']);
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
