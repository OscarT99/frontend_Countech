import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddPedidoComponent } from './add.pedido.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: ':id', component: AddPedidoComponent }		 
	])],
	exports: [RouterModule]
})
export class AddPedidoRoutingModule { }
