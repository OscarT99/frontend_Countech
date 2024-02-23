import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegProduccionComponent } from './regProduccion.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: RegProduccionComponent }
	])],
	exports: [RouterModule]
})
export class RegProduccionRoutingModule { }