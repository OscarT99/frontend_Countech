import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClienteComponent } from './cliente.component'; 

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ClienteComponent }		 
	])],
	exports: [RouterModule]
})
export class ClienteRoutingModule { }
