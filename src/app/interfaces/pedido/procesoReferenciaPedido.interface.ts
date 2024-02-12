import { ColorProcesoReferenciaPedidoInstance } from "./colorProcesoReferenciaPedido.interface";
import { AsignarProcesoEmpleado } from "../produccion/asignarProceso.interface";
  
export interface ProcesoReferenciaPedidoInstance {
  id?: number;
  pedido?: number;
  proceso?: string;
  tipoDeMaquina?: 'Fileteadora' | 'Plana' | 'Presilladora' | 'Recubridora' | 'Manual';
  cantidadTotal?: number;
  cantidadAsignada?: number;
  cantidadHecha?: number;
  cantidadPendiente?: number;
  estado?: boolean;
  ColorEnProcesoEnReferenciaEnPedidos?: ColorProcesoReferenciaPedidoInstance[];
  AsignarProcesoEmpleado?: AsignarProcesoEmpleado[];
}

  