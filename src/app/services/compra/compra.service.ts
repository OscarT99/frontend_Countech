import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { CompraInstance } from 'src/app/interfaces/compra/compra.interface'; 
import { Observable, catchError } from 'rxjs';

@Injectable()
  export class CompraService {
    private myAppUrl: string;  
    private myApiUrl: string; 
  
    constructor(private http: HttpClient) { 
      this.myAppUrl = environment.endpoint
      this.myApiUrl = 'api/compra/'
    }
  
    getCompra(id:number): Observable<CompraInstance>{
      return this.http.get<CompraInstance>(`${this.myAppUrl}${this.myApiUrl}${id}`)
    }
    
    getListCompras(): Observable<CompraInstance[]>{
      return this.http.get<CompraInstance[]>(`${this.myAppUrl}${this.myApiUrl}`)    
    }
  
    postCompra(compra : CompraInstance):Observable<void>{
      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,compra)
    }
  
    putCompra(id:number,compra:CompraInstance):Observable<void>{
      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,compra)
    }

    anularCompra(id: number, estadoCompra: boolean, motivoDeAnulacion: string): Observable<any> {
      const url = `${this.myAppUrl}${this.myApiUrl}anularCompra/${id}`;
      const body = { estadoCompra, motivoDeAnulacion }; // Agregamos el estado y el motivo al cuerpo
  
      return this.http.put<any>(url, body)
          .pipe(
              catchError((error: any) => {
                  console.error('Error al anular la compra desde el servicio:', error);
                  throw error;
              })
          );
  }
  

  }
  