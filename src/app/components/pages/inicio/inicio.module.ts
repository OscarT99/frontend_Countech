import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InicioRoutingModule } from './inicio-routing.module';
import { InicioComponent } from './inicio.component';

import { TimelineModule } from 'primeng/timeline';
@NgModule({
    imports: [
        CommonModule,
        InicioRoutingModule,
        TimelineModule
    ],
    declarations: [InicioComponent]
})
export class InicioModule { }
