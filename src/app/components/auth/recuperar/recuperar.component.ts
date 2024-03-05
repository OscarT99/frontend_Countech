
import { NgForm } from '@angular/forms';
import { Component, ChangeDetectorRef  } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
//import { BtnLoadingComponent } from 'src/app/shared/components/btn-loading/btn-loading.component';
import { AuthService } from 'src/app/services/login/login.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppModule } from 'src/app/app.module';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.scss']
})
export class RecuperarComponent {

  constructor(
    private apiUsuarios: AuthService,
    private router: Router,
    private toastr : ToastrService,
    public bsModalRef: BsModalRef
  ){}


  email:string | undefined;
  contrasena:string | undefined;

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

  loading:boolean=false;
  emailValido: boolean = false;
  

  emailCompleto():boolean{
    return (
      !!this.user.email 
    )
  }

  validaremail() {
    const validacionemail = /^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]+@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/;
    if (!this.user.email || !this.user.email.trim()) {
      this.errorMessages.recuperar = 'El email es necesario para recuperar la cantraseña';
      this.emailValido = false;
    } else if (!validacionemail.test(this.user.email)) {
      this.errorMessages.recuperar = 'El email debe tener una estructura válida (usuario@dominio.com).';
      this.emailValido = false;
    } else if (this.user.email.length > 100) {
      this.errorMessages.recuperar = 'El email no debe superar los 100 caracteres.';
      this.emailValido = false;
    } else {
      this.errorMessages.recuperar = '';
      this.emailValido = true;
    }
  }
  

    validarContrasena(){
      const validacion = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
      const contrasena = (document.getElementById('contrasena') as HTMLInputElement).value;
 
      if(!contrasena){
       this.errorMessages.contrasena=''
      }
      else if(!validacion.test(contrasena)){
       this.errorMessages.contrasena='Minimo 8 caracteres, 1 mayuscula y un simbolo.';
      }else if (this.user.contrasena.length > 50) {
       this.errorMessages.contrasena = 'La contraseña no debe superar los 50 caracteres.';
     }
      else{
       this.errorMessages.contrasena=''
      }
   }
   mensajeColor: string | undefined;


  
   forgotPassword(form: NgForm) {
    // Obtener el valor del campo de email del formulario
    const email = form.value.email;
  
    // Cambiar el estado de loading antes de llamar al servicio
    this.loading = true;
  
    // Llamar al servicio para solicitar el restablecimiento de contraseña
    this.apiUsuarios.forgotPassword({ email }).subscribe(
        (response) => {
            if (response.message) {
                // Asignar el mensaje de éxito a una propiedad en tu componente
                this.errorMessages.recuperar = response.message;
                // Establecer el color del mensaje como verde si la operación fue exitosa
                this.mensajeColor = 'green';

                // Establecer un temporizador para borrar el mensaje y cerrar el modal después de 2 segundos
                setTimeout(() => {
                    this.errorMessages.recuperar = '';
                    this.mensajeColor = ''; // Restablecer el color
                    this.cerrarModal1(); // Cierra el modal
                }, 2000);
            }
        },
        (error) => {
            if (error.error && error.error.error) {
                this.errorMessages.recuperar = error.error.error;
                // Establecer el color del mensaje como rojo si hay un error
                if (error.error.error === 'El usuario no esta registrado') {
                    this.mensajeColor = 'red';
                    // Establecer un temporizador para borrar el mensaje después de 2 segundos
                    setTimeout(() => {
                        this.errorMessages.recuperar = '';
                        this.mensajeColor = ''; // Restablecer el color
                    }, 2000);
                } else {
                    // Dejar el color predeterminado si no es un error específico relacionado con el email
                    if (error.error.error !== 'El usuario no esta registrado.') {
                        this.errorMessages.recuperar = ''; // Borrar cualquier mensaje de error relacionado con el email
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



}
