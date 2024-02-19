import { Injectable, numberAttribute } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<InsumoInstance>(`${this.myAppUrl}${this.myApiUrl}${id}`)
   }

   getListInsumos():Observable<InsumoInstance[]>{
    return this.http.get<InsumoInstance[]>(`${this.myAppUrl}${this.myApiUrl}`)
   }

   getListInsumosCompra(): Observable<{ listInsumos: InsumoInstance[] }> {
    return this.http.get<{ listInsumos: InsumoInstance[] }>(`${this.myAppUrl}${this.myApiUrl}`);
  }

   postInsumo(insumo: InsumoInstance):Observable<void>{
    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,insumo)
   }

   putInsumo(id:number,insumo:InsumoInstance):Observable<void>{
    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,insumo)
   }

   deleteInsumo(id:number):Observable<void>{
    return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`)
   }
   
    buscarInsumos(termino: string): Observable<InsumoInstance[]> {
        const url = `${this.myAppUrl}${this.myApiUrl}buscar?termino=${termino}`;
        return this.http.get<InsumoInstance[]>(url);
    }

    sumarCantidadInsumo(id: number, nuevaCantidad: number): Observable<any> {
      const url = `${this.myAppUrl}${this.myApiUrl}sumarCantidad/${id}`;
      const body = { nuevaCantidad };
    
      return this.http.put<any>(url, body)
        .pipe(
          catchError((error: any) => {
            console.error('Error al sumar la cantidad del insumo desde el servicio:', error);
            throw error;
          })
        );
    }

    restarCantidadInsumo(id: number, nuevaCantidad: number): Observable<any> {
      const url = `${this.myAppUrl}${this.myApiUrl}restarCantidad/${id}`;
      const body = { nuevaCantidad };
    
      return this.http.put<any>(url, body)
        .pipe(
          catchError((error: any) => {
            console.error('Error al restar la cantidad del insumo desde el servicio:', error);
            throw error;
          })
        );
    }

    actualizarEstadoInsumo(id: number, estado: boolean): Observable<any> {
      const url = `${this.myAppUrl}${this.myApiUrl}actualizarEstado/${id}`;
      const body = { estado }; // Agregamos el estado al cuerpo

      return this.http.put<any>(url, body)
        .pipe(
          catchError((error: any) => {
            console.error('Error al actualizar el estado del insumo desde el servicio:', error);
            throw error;
          })
        );
    }

}
