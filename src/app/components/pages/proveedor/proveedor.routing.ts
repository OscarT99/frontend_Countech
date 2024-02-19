import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProveedorComponent } from './proveedor.component'; 

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ProveedorComponent }		 
	])],
	exports: [RouterModule]
})
export class ProveedorRoutingModule { }
