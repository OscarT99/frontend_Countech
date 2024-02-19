import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddCompraComponent } from './add.compra.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: ':id', component: AddCompraComponent }		 
	])],
	exports: [RouterModule]
})
export class AddCompraRoutingModule { }
