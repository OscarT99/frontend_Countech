import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OlvidoContrasenaComponent } from './olvido-contrasena.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: OlvidoContrasenaComponent }
    ])],
    exports: [RouterModule]
})
export class OlvidoContrasenaRoutingModule { }
