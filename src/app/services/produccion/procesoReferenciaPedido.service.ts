import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment'; //Está mal escrito enviroments, debe ser environment
import { ProcesoReferenciaPedido } from 'src/app/interfaces/pedido/procesoReferenciaPedido.interface';
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
  
  getProcesosEnReferenciaEnPedido(): Observable<ProcesoReferenciaPedido[]> {
    return this.http.get<ProcesoReferenciaPedido[]>(`${this.myAppUrl}${this.myApiUrl}`);
  }

  getProcesoEnReferenciaEnPedido(id: number): Observable<ProcesoReferenciaPedido> {
    return this.http.get<ProcesoReferenciaPedido>(`${this.myAppUrl}${this.myApiUrl}${id}`);
  }

  putProcesoCantidad(id: number, procesoCantidad: ProcesoReferenciaPedido): Observable<void> {
    return this.http.put<void>(`${this.myAppUrl}${this.putUrl}${id}`, procesoCantidad);
  }



}
