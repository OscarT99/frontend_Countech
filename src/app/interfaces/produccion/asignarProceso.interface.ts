import { AvanceProcesoEmpleado } from "./avanceProcesoEmpleado.interface";

export interface AsignarProcesoEmpleado {
    id?: number;
    cantidadAsignada: number;
    cantRestante?: number;
    estadoProcAsig?: boolean;
    estadoAnular?: boolean;
    proceso?: number;
    pedidoprocesoId: number;
    empleadoId: number;
    AvanceProcesoEmpleado?: AvanceProcesoEmpleado[];
  }

  export interface EstadoAnular {
    estadoAnular: boolean;
  }