import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListCompraRoutingModule } from './list.compra.routing';   
import { ListCompraComponent } from './list.compra.component';  
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';


@NgModule({
    imports: [
        CommonModule,
        ListCompraRoutingModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        InputTextareaModule,
        DialogModule, 
        TooltipModule,
        TagModule ,                           
        ConfirmPopupModule, 
        InputNumberModule,
        ReactiveFormsModule,
        TooltipModule,
        TagModule                            
    ],
    declarations: [ListCompraComponent]
})
export class ListCompraModule { }
