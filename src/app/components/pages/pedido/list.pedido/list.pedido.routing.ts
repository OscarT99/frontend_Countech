import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ListPedidoComponent } from './list.pedido.component'; 

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ListPedidoComponent }		 
	])],
	exports: [RouterModule]
})
export class ListPedidoRoutingModule { }
