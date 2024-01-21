import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OlvidoContrasenaRoutingModule } from './olvido-contrasena-routing.module';
import { OlvidoContrasenaComponent } from './olvido-contrasena.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
    imports: [
        CommonModule,
        OlvidoContrasenaRoutingModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        PasswordModule
    ],
    declarations: [OlvidoContrasenaComponent]
})
export class OlvidoContrasenaModule { }
