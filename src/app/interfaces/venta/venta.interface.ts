export interface Venta {
    id?: number;
    cliente?: number;
    ordenTrabajo?: string;
    fechaVenta?: Date | null;
    formaPago?: 'Contado' | 'Crédito';
    valorTotal?: number;
    estadoPago?: 'Pago' | 'Pendiente';
}
  