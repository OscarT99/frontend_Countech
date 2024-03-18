import { Proveedor } from "../proveedor/proveedor.interface";
import { DetalleCompraInstance } from "./detalleCompra.interface";

export interface CompraInstance {
    id?: number;
    Proveedor?:Proveedor;
    proveedor?:number;
    fechaCompra?:Date;
    numeroFactura?: string;
    formaPago?:'Contado' | 'Crédito';
    totalBruto?:number,
    iva?:number,
    totalNeto?:number
    DetalleEnCompras?: DetalleCompraInstance[];
    observaciones?:string;
    estadoCompra?:boolean,
    motivoDeAnulacion?:string,
    estadoPago?: string,
}