import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface'; 
import { ProcesoReferenciaPedidoInstance } from 'src/app/interfaces/pedido/procesoReferenciaPedido.interface'; 
import { Observable } from 'rxjs';

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

    getPedidoProcesos(): Observable<ProcesoReferenciaPedidoInstance[]>{
      return this.http.get<ProcesoReferenciaPedidoInstance[]>(`${this.myAppUrl}${this.myApiUrl}proceso`)
    }

    getPedidoProcesoById(id:number): Observable<ProcesoReferenciaPedidoInstance[]>{
      return this.http.get<ProcesoReferenciaPedidoInstance[]>(`${this.myAppUrl}${this.myApiUrl}proceso/${id}`)
    }
  
    postPedido(pedido : PedidoInstance):Observable<void>{
      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,pedido)
    }
  
    putPedido(id:number,pedido:PedidoInstance):Observable<void>{
      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,pedido)
    }

    deletePedido(id:number): Observable<void>{
      return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`)
    }
      
  }
  