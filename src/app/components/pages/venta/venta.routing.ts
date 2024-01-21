import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VentaComponent } from './venta.component'; 
//import { AuthGuard } from '../../../guards/auth.guard'; // Ruta al archivo de tu AuthGuard

const routes: Routes = [
  { path: '', component: VentaComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentaRoutingModule { }
