import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../app.layout.service';
import { AuthService } from 'src/app/services/login/login.service';
import { ConfirmationService, Confirmation } from 'primeng/api';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    providers: [ConfirmationService]

})
export class AppTopBarComponent {

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService,
        private authService: AuthService,
        private confirmationService: ConfirmationService,
    ) { }

    logout() {
        this.authService.logout();
    }

    private confirmLogout() {
        this.confirmationService.confirm({
            key: 'logoutConfirmation',
            message: '¿Está seguro de cerrar sesión?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.authService.logout();
            }
        });
    }

}
