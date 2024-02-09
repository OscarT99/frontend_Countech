/*
import { HttpClient } from '@angular/common/http';
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
      return this.http.get<Venta>(`${this.myAppUrl}${this.myApiUrl}${id}`)
    }
  
    getListVentas(): Observable<Venta[]>{
      return this.http.get<Venta[]>(`${this.myAppUrl}${this.myApiUrl}`)    
    }
  
    putVenta(id:number,venta:Venta):Observable<void>{
      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,venta)
    }
    
  }
  
*/

import { HttpClient } from '@angular/common/http';
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
      return this.http.get<Venta>(`${this.myAppUrl}${this.myApiUrl}${id}`)
    }
  
    getListVentas(): Observable<Venta[]>{
      return this.http.get<Venta[]>(`${this.myAppUrl}${this.myApiUrl}`)    
    }
  
    putVenta(id:number,venta:Venta):Observable<void>{
      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,venta)
    }
    
  }
  