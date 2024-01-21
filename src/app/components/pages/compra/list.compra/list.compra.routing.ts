import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ListCompraComponent } from './list.compra.component'; 

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ListCompraComponent }		 
	])],
	exports: [RouterModule]
})
export class ListCompraRoutingModule { }
