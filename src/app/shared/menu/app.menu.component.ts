import { Component,OnInit } from "@angular/core";
import { LayoutService } from "../app.layout.service";

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Inicio', icon: 'pi pi-fw pi-home', routerLink: ['/pages/inicio'] }
                ]
            },
            {
                label: 'Usuarios',
                items: [
                    { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/pages/usuario'] },                    
                ]
            },
            {
                label: 'Compras',
                items: [
                    { label: 'Proveedores', icon: 'pi pi-fw pi-user', routerLink: ['/pages/proveedor'] },
                    { label: 'Insumos', icon: 'pi pi-fw pi-box', routerLink: ['/pages/insumo'] },
                    { label: 'Compras', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/pages/compra'] },
                ]
            },
            {
                label: 'Producción',
                items: [
                    { label: 'Empleados', icon: 'pi pi-fw pi-user', routerLink: ['/pages/empleado'] },
                    { label: 'Producción', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/pages/produccion'] },
                    { label: 'Registro de producción', icon: 'pi pi-fw pi-file', routerLink: ['/pages/produccion/registro'] },
                ]
            },
            {
                label: 'Ventas',
                items: [
                    { label: 'Clientes', icon: 'pi pi-fw pi-user', routerLink: ['/pages/cliente'] },
                    { label: 'Pedidos', icon: 'pi pi-fw pi-file-o', routerLink: ['/pages/pedido'] },
                    { label: 'Ventas', icon: 'pi pi-fw pi-book', routerLink: ['/pages/venta'] },
                ]
            },
        ];
    }
}
