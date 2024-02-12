import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports:[RouterModule.forChild([
        {path:'proveedor',loadChildren:()=>import('./proveedor/proveedor.module').then(m => m.ProveedorModule)},        
        {path:'cliente',loadChildren:()=>import('./cliente/cliente.module').then(m => m.ClienteModule)},   
        {path:'usuario',loadChildren:()=>import('./usuario/usuario.module').then(m => m.UsuarioModule)},      
        {path:'venta',loadChildren:()=>import('./venta/venta.module').then(m => m.VentaModule)},                     
        {path:'abonoVenta',loadChildren:()=>import('./abonoVenta/abonoVenta.module').then(m => m.AbonoVentaModule)},                     
        {path:'empleado',loadChildren:()=>import('./empleado/empleado.module').then(m => m.EmpleadoModule)},                     
        {path:'produccion',loadChildren:()=>import('./produccion/produccion.module').then(m => m.ProduccionModule)},                             
        {path:'pedido',loadChildren:()=>import('./pedido/list.pedido/list.pedido.module').then(m => m.ListPedidoModule)},
        {path:'pedido',loadChildren:()=>import('./pedido/list.pedido/list.pedido.module').then(m => m.ListPedidoModule)},
        {path:'pedido/add',loadChildren:()=>import('./pedido/add.pedido/add.pedido.module').then(m => m.AddPedidoModule)},
        {path:'compra',loadChildren:()=>import('./compra/list.compra/list.compra.module').then(m => m.ListCompraModule)},
        {path:'compra/add',loadChildren:()=>import('./compra/add.compra/add.compra.module').then(m => m.AddCompraModule)},
        {path:'insumo',loadChildren:()=>import('./insumo/insumo.module').then(m => m.InsumoModule)},        

    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }