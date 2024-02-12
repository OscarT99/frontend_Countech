export interface EmpleadoProcesos {
    id?: number;
    cantidadAsignada?: number;
    cantidadRestante?: number;
    estadoProcAsig?: boolean;
    estadoAnular?: boolean;
    pedidoprocesoid: number;
  }