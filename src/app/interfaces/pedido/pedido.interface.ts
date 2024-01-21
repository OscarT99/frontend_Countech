  import {ProcesoReferenciaPedidoInstance } from "./procesoReferenciaPedido.interface";

  export interface PedidoInstance {
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
    
