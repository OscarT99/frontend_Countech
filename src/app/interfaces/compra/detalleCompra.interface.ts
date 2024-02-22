import { InsumoInstance } from "../insumo/insumo.interface";

export interface DetalleCompraInstance {
    Insumo?: InsumoInstance,
    id?:string,
    compra?:number;    
    insumo?:number;
    cantidad?:number;
    valorUnitario?:number;
    impuestoIva?:number;
    valorTotal?:number;
}