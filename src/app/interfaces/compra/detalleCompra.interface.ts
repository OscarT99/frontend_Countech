import { InsumoInstance } from "../insumo/insumo.interface";

export interface DetalleCompraInstance {
    Insumo?: InsumoInstance,
    id?:string,
    insumoNombre?:string;
    compra?:number;    
    insumo?:number;
    cantidad?:number;
    valorUnitario?:number;
    ivaPorcentaje?:number;
    impuestoIva?:number;
    valorTotal?:number;
}