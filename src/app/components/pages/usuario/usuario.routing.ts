import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsuarioComponent } from './usuario.component';  

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: UsuarioComponent }
	])],
	exports: [RouterModule]
})
export class UsuarioRoutingModule { }
