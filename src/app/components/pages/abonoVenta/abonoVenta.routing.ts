import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AbonoVentaComponent } from './abonoVenta.component'; 

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: AbonoVentaComponent }		 
	])],
	exports: [RouterModule]
})
export class AbonoVentaRoutingModule { }
