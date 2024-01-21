import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmpleadoComponent } from './empleado.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: EmpleadoComponent }
	])],
	exports: [RouterModule]
})
export class EmpleadoRoutingModule { }