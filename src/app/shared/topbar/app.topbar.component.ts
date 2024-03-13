import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../app.layout.service';
import { AuthService } from 'src/app/services/login/login.service';
import { ConfirmationService, Confirmation, MessageService } from 'primeng/api';
import { UsuarioService } from 'src/app/services/usuario/usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrls: ['./app.topbar.component.css']
})
export class AppTopBarComponent {
  showButtons = false;
  items!: MenuItem[];
  productDialog: boolean = false;
  id: number = 0;

  nombreUsuario: string = '';
  emailUsuario: string = '';
  cedulaUsuario: string = '';
  

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(public layoutService: LayoutService,
    private _authService: AuthService,
    private _usuarioService: UsuarioService,
    private confirmationService: ConfirmationService,

  ) { }
    

  logout(event: Event) {
    this.confirmationService.confirm({
      key: 'confirmCerrarSesion',
      message: '¿Está seguro de cerrar sesión?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      accept: () => {
        this._authService.logout();
      }
    });
  }


  abrirPerfil() {
    const user = this._authService.getUser();
    if (user) {
      this.id = user.id;
      this.productDialog = true;
      this.getUsuarioLogin(this.id); 
      console.log(user);
    }
  }
  
  hideDialog() {
    this.productDialog = false;
  }


  getUsuarioLogin(id: number) {
    const currentUser = this._authService.getUser();
  
    if (currentUser) {
      this.nombreUsuario = currentUser.nombre;
      this.emailUsuario = currentUser.email;
      this.cedulaUsuario = currentUser.cedula;
    }
  }
  

    // Método para mostrar los botones
    showButtonsOnClick() {
      this.showButtons = true;
    }
  
    // Método para ocultar los botones
    hideButtons() {
      this.showButtons = false;
    }



}
