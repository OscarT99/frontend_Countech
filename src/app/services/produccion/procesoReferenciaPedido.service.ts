import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment'; //Está mal escrito enviroments, debe ser environment
import { ProcesoReferenciaPedidoInstance } from 'src/app/interfaces/pedido/procesoReferenciaPedido.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class procesoReferenciaPedidoService {
  private myAppUrl: string;
  private myApiUrl: string;
  private putUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/proceso/';
    this.putUrl = 'api/proceso/cantidad/';
  }
  
  getProcesosEnReferenciaEnPedido(): Observable<ProcesoReferenciaPedidoInstance[]> {
    return this.http.get<ProcesoReferenciaPedidoInstance[]>(`${this.myAppUrl}${this.myApiUrl}`);
  }

  getProcesoEnReferenciaEnPedido(id: number): Observable<ProcesoReferenciaPedidoInstance> {
    return this.http.get<ProcesoReferenciaPedidoInstance>(`${this.myAppUrl}${this.myApiUrl}${id}`);
  }

  putProcesoCantidad(id: number, procesoCantidad: ProcesoReferenciaPedidoInstance): Observable<void> {
    return this.http.put<void>(`${this.myAppUrl}${this.putUrl}${id}`, procesoCantidad);
  }



}
