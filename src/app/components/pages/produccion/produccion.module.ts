import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ProduccionRoutingModule } from './produccion-routing.module';
import { ProduccionComponent } from './produccion.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TimelineModule } from 'primeng/timeline';
import { InputTextModule } from 'primeng/inputtext';
import { TreeTableModule } from 'primeng/treetable';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessagesModule } from 'primeng/messages';

@NgModule({
    imports: [
        AutoCompleteModule,
        ConfirmDialogModule,
        TagModule,
        InputNumberModule,
        CommonModule,
        ToolbarModule,
        ProduccionRoutingModule,
        TimelineModule,
        AccordionModule,
        TabMenuModule,
        TabViewModule,
        TableModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        TreeTableModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        InputSwitchModule,
        MessagesModule

    ],
    declarations: [ProduccionComponent],
})
export class ProduccionModule { }