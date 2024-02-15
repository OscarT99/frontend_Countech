import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages.routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmationService } from 'primeng/api';

@NgModule({
    declarations: [],
    providers: [ConfirmationService], 
    imports: [
        CommonModule,
        PagesRoutingModule,
        HttpClientModule,                                
    ]
})
export class PagesModule { }
