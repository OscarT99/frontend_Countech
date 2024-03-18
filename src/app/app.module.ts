import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';



import { AppLayoutModule } from './shared/app.layout.module';

import { ClienteService } from './services/cliente/cliente.service';
import { PedidoService } from './services/pedido/pedido.service';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from './services/usuario/usuario.service';
import { AuthService } from './services/login/login.service';
import { VentaService } from './services/venta/venta.service';
import { AbonoVentaService } from './services/abonoVenta/abonoVenta.service';
import { CompraService } from './services/compra/compra.service';
import { AbonoCompraService } from './services/abonoCompra/abonoCompra.service';

import { ModalModule } from 'ngx-bootstrap/modal';
import { CambiarContrasenaComponent } from './components/auth/cambiar-contrasena/cambiar-contrasena.component';
import { RecuperarComponent } from './components/auth/recuperar/recuperar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthInterceptor } from './components/interceptors/auth-interceptor';


@NgModule({
  declarations: [
    AppComponent,
    CambiarContrasenaComponent,
    RecuperarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppLayoutModule,  
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right'
    }),      
    ModalModule.forRoot(), 
    FormsModule,
    CommonModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    ClienteService,UsuarioService,AuthService, VentaService, AbonoVentaService,PedidoService,CompraService, AbonoCompraService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // indica que puede haber múltiples interceptores
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
