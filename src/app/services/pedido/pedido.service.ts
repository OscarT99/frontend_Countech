import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface'; 
import { Observable, catchError } from 'rxjs';

@Injectable()
  export class PedidoService {
    private myAppUrl: string;  
    private myApiUrl: string; 
  
    constructor(private http: HttpClient) { 
      this.myAppUrl = environment.endpoint
      this.myApiUrl = 'api/pedido/'
    }
  
    getPedido(id:number): Observable<PedidoInstance>{
      return this.http.get<PedidoInstance>(`${this.myAppUrl}${this.myApiUrl}${id}`)
    }
    
    getListPedidos(): Observable<PedidoInstance[]>{
      return this.http.get<PedidoInstance[]>(`${this.myAppUrl}${this.myApiUrl}`)    
    }
  
    postPedido(pedido : PedidoInstance):Observable<void>{
      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,pedido)
    }

    putPedido(id:number,pedido:PedidoInstance):Observable<void>{
      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,pedido)
    }

    anularPedido(id: number, estadoPedido: boolean, motivoDeAnulacion: string): Observable<any> {
      const url = `${this.myAppUrl}${this.myApiUrl}anularPedido/${id}`;
      const body = { estadoPedido, motivoDeAnulacion }; // Agregamos el estado y el motivo al cuerpo
  
      return this.http.put<any>(url, body)
          .pipe(
              catchError((error: any) => {
                  console.error('Error al anular el pedido desde el servicio:', error);
                  throw error;
              })
          );
    }
  }
  