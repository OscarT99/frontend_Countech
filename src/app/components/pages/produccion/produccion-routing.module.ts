import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { ProduccionComponent } from './produccion.component';

@NgModule({
	imports: [RouterModule.forChild([
		// { path: '', component: ProduccionComponent }
	])],
	exports: [RouterModule]
})
export class ProduccionRoutingModule { }