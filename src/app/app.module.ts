import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';



import { AppLayoutModule } from './shared/app.layout.module';

import { ClienteService } from './services/cliente/cliente.service';
import { PedidoService } from './services/pedido/pedido.service';

import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from './services/usuario/usuario.service';
import { AuthService } from './services/login/login.service';
import { VentaService } from './services/venta/venta.service';
import { AbonoVentaService } from './services/abonoVenta/abonoVenta.service';
import { CompraService } from './services/compra/compra.service';




@NgModule({
  declarations: [
    AppComponent,
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
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    ClienteService,UsuarioService,AuthService, VentaService, AbonoVentaService,PedidoService,CompraService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
