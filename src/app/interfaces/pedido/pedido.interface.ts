  import {ProcesoReferenciaPedidoInstance } from "./procesoReferenciaPedido.interface";
  import { Cliente } from 'src/app/interfaces/cliente/cliente.interface';

  export interface PedidoInstance {
      Cliente?:Cliente;
      id?: number;
      cliente?: number;
      ordenTrabajo?: string;
      fechaOrdenTrabajo?: Date;
      fechaEntregaOrden?: Date;
      formaPago?: 'Contado' | 'Crédito';
      valorTotal?: number;
      observaciones?: string;
      estadoPedido?:boolean,
      motivoDeAnulacion?:string,
      estado?:string,
      referencia?: string;
      descripcion?: string;
      valorUnitario?: number;
      cantidadTotal?: number;
      ProcesoEnReferenciaEnPedidos?: ProcesoReferenciaPedidoInstance[];      
    }
    
