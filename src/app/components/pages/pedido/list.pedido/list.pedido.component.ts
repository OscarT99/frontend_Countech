import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { PedidoService } from 'src/app/services/pedido/pedido.service'; 
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface'; 
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';


@Component({
    templateUrl: './list.pedido.component.html',
    
})
export class ListPedidoComponent implements OnInit {
    listPedidos: PedidoInstance[] = []
    pedido: PedidoInstance = {}
    id:number=0;

    mostrarModalDetalle: boolean = false;
    pedidoIdSeleccionado!: number;
    detallePedido: any; // Puedes ajustar esto según la estructura de tu pedido
    @ViewChild('detallePedidoModal') detallePedidoModal!: Dialog;
   
    rowsPerPageOptions = [5, 10, 15];


    constructor(
      private _pedidoService:PedidoService,
      private toastr: ToastrService,      
      private aRouter:ActivatedRoute,
      private router : Router,
      ){}

    ngOnInit():void {        
        this.getListPedidos()                               
    }

    
    getListPedidos(){     
        this._pedidoService.getListPedidos().subscribe((data:any) =>{              
          this.listPedidos = data.listaPedidos; 
         
        })        
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
        
    editarPedido(id: number): void {
        this.router.navigate(['/pages/pedido/add', id]);
    }
      
    eliminarPedido(id: number, estado: string): void {
    if (estado === 'Registrado') {
        this._pedidoService.deletePedido(id).subscribe(() => {
            this.toastr.success('Pedido eliminado correctamente', 'Éxito');
            this.getListPedidos();
        }, (error) => {
            this.toastr.error('Error al eliminar el pedido', 'Error');
            console.error(error);
        });
    } else {
        this.toastr.warning('No se puede eliminar un pedido con estado diferente a "Registrado"', 'Advertencia');
    }
    }

    async mostrarDetallePedido(id: number) {
        try {
            this.detallePedido = await this._pedidoService.getPedido(id).toPromise();
            console.log('Detalle del pedido:', this.detallePedido);
            this.mostrarModalDetalle = true;
        } catch (error) {
            console.error('Error al obtener el detalle del pedido:', error);
        }
    }
    
    // cerrarModalDetallePedido() {
    //     this.mostrarModalDetalle = false;
    //     this.detallePedido = null; 
    // }

}
