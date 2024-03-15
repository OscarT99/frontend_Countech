import { HttpClient, HttpHeaders } from '@angular/common/http';
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

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
      
      return this.http.get<CompraInstance>(`${this.myAppUrl}${this.myApiUrl}${id}`, {headers})
    }
    
    getListCompras(): Observable<CompraInstance[]>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.get<CompraInstance[]>(`${this.myAppUrl}${this.myApiUrl}`, {headers})    
    }
  
    postCompra(compra : CompraInstance):Observable<void>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,compra, {headers})
    }

    anularCompra(id: number, estadoCompra: boolean, motivoDeAnulacion: string): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
  
      const url = `${this.myAppUrl}${this.myApiUrl}anularCompra/${id}`;
      const body = { estadoCompra, motivoDeAnulacion };
  
      const options = { headers: headers };
  
      return this.http.put<any>(url, body, options)
        .pipe(
          catchError((error: any) => {
            console.error('Error al anular la compra desde el servicio:', error);
            throw error;
          })
        );
    }

    putCompra(id:number, compra : CompraInstance):Observable<void>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,compra, {headers})
    }
  

  }
  