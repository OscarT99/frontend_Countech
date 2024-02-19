import { Injectable, numberAttribute } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/environment';
import { InsumoInstance } from 'src/app/interfaces/insumo/insumo.interface'; 
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InsumoService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint
    this.myApiUrl = 'api/insumo/'
   }

   getInsumo(id:number):Observable<InsumoInstance>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<InsumoInstance>(`${this.myAppUrl}${this.myApiUrl}${id}`, {headers})
   }

   getListInsumos():Observable<InsumoInstance[]>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<InsumoInstance[]>(`${this.myAppUrl}${this.myApiUrl}`, {headers})
   }

   getListInsumosCompra(): Observable<{ listInsumos: InsumoInstance[] }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<{ listInsumos: InsumoInstance[] }>(`${this.myAppUrl}${this.myApiUrl}`, {headers});
  }

   postInsumo(insumo: InsumoInstance):Observable<void>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,insumo, {headers})
   }

   putInsumo(id:number,insumo:InsumoInstance):Observable<void>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,insumo, {headers})
   }

   deleteInsumo(id:number):Observable<void>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');
    
    return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`, {headers})
   }
   
    buscarInsumos(termino: string): Observable<InsumoInstance[]> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

        const url = `${this.myAppUrl}${this.myApiUrl}buscar?termino=${termino}`;
        return this.http.get<InsumoInstance[]>(url, { headers });
    }

    sumarCantidadInsumo(id: number, nuevaCantidad: number): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      const url = `${this.myAppUrl}${this.myApiUrl}sumarCantidad/${id}`;
      const body = { nuevaCantidad };
    
      const options = { headers: headers };

      return this.http.put<any>(url, body, options)
        .pipe(
          catchError((error: any) => {
            console.error('Error al sumar la cantidad del insumo desde el servicio:', error);
            throw error;
          })
        );
    }

    restarCantidadInsumo(id: number, nuevaCantidad: number): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      const url = `${this.myAppUrl}${this.myApiUrl}restarCantidad/${id}`;
      const body = { nuevaCantidad };

      const options = { headers: headers };
    
      return this.http.put<any>(url, body, options)
        .pipe(
          catchError((error: any) => {
            console.error('Error al restar la cantidad del insumo desde el servicio:', error);
            throw error;
          })
        );
    }

    restarCantidadInsumoCompra(id: number, cantidad: number): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      const url = `${this.myAppUrl}${this.myApiUrl}restarCantidadCompra/${id}`;
      const body = { cantidad };
    
      const options = { headers: headers };

      return this.http.put<any>(url, body, options)
        .pipe(
          catchError((error: any) => {
            console.error('Error al restar la cantidad del insumo desde el servicio:', error);
            throw error;
          })
        );
    }

    actualizarEstadoInsumo(id: number, estado: boolean): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
      
      const url = `${this.myAppUrl}${this.myApiUrl}actualizarEstado/${id}`;
      const body = { estado }; // Agregamos el estado al cuerpo

      const options = { headers: headers };

      return this.http.put<any>(url, body, options)
        .pipe(
          catchError((error: any) => {
            console.error('Error al actualizar el estado del insumo desde el servicio:', error);
            throw error;
          })
        );
    }

}
