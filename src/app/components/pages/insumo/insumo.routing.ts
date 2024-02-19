import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InsumoComponent } from './insumo.component';  

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: InsumoComponent }		 
	])],
	exports: [RouterModule]
})
export class InsumoRoutingModule { }
