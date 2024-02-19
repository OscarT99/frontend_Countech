import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { Venta } from 'src/app/interfaces/venta/venta.interface';
import { Observable } from 'rxjs';

@Injectable()
  export class VentaService {
    private myAppUrl: string;  
    private myApiUrl: string; 
  
    constructor(private http: HttpClient) { 
      this.myAppUrl = environment.endpoint
      this.myApiUrl = 'api/venta/'
    }
  
    getVenta(id:number): Observable<Venta>{
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
  
      return this.http.get<Venta>(`${this.myAppUrl}${this.myApiUrl}${id}`, {headers})
    }
  
    getListVentas(): Observable<Venta[]>{
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
  
      return this.http.get<Venta[]>(`${this.myAppUrl}${this.myApiUrl}`, {headers})    
    }
  
    putVenta(id:number,venta:Venta):Observable<void>{
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
  
      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,venta, {headers})
    }
    
  }
  