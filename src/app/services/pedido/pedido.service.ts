import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface';
import { Observable, catchError } from 'rxjs';
import { ProcesoReferenciaPedidoInstance } from 'src/app/interfaces/pedido/procesoReferenciaPedido.interface';

@Injectable()
export class PedidoService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint
    this.myApiUrl = 'api/pedido/'
  }

  getPedido(id: number): Observable<PedidoInstance> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<PedidoInstance>(`${this.myAppUrl}${this.myApiUrl}${id}`, { headers })
  }

  getListPedidos(): Observable<PedidoInstance[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<PedidoInstance[]>(`${this.myAppUrl}${this.myApiUrl}`, { headers })
  }

  // Métodos para actualizar los registros

  getPedidoInfo(): Observable<PedidoInstance[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<PedidoInstance[]>(`${this.myAppUrl}${this.myApiUrl}info`, { headers })
  }

  getPedidoProcesos(): Observable<ProcesoReferenciaPedidoInstance[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<ProcesoReferenciaPedidoInstance[]>(`${this.myAppUrl}${this.myApiUrl}proceso`, { headers })
  }

  getPedidoProcesoById(id: number): Observable<ProcesoReferenciaPedidoInstance[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<ProcesoReferenciaPedidoInstance[]>(`${this.myAppUrl}${this.myApiUrl}proceso/${id}`, { headers })
  }

  postPedido(pedido: PedidoInstance): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`, pedido, { headers })
  }

  putPedido(id: number, pedido: PedidoInstance): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`, pedido, { headers })
  }

  anularPedido(id: number, estadoPedido: boolean, motivoDeAnulacion: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    const url = `${this.myAppUrl}${this.myApiUrl}anularPedido/${id}`;
    const body = { estadoPedido, motivoDeAnulacion }; // Agregamos el estado y el motivo al cuerpo

    const options = { headers: headers };

    return this.http.put<any>(url, body, options)
      .pipe(
        catchError((error: any) => {
          console.error('Error al anular el pedido desde el servicio:', error);
          throw error;
        })
      );
  }

}
