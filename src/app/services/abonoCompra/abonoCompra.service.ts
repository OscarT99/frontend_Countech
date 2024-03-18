import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { AbonoCompra } from 'src/app/interfaces/abonoCompra/abonoCompra.interface';
import { Observable } from 'rxjs';

@Injectable()
  export class AbonoCompraService {
    private myAppUrl: string;  
    private myApiUrl: string; 
  
    constructor(private http: HttpClient) { 
      this.myAppUrl = environment.endpoint
      this.myApiUrl = 'api/abonoCompra/'
    }
  
    getAbonoCompra(id:number): Observable<AbonoCompra>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.get<AbonoCompra>(`${this.myAppUrl}${this.myApiUrl}${id}`, {headers})
    }
  
    getListAbonoCompras(): Observable<AbonoCompra[]>{
      
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.get<AbonoCompra[]>(`${this.myAppUrl}${this.myApiUrl}`, {headers})    
    }
  
    postAbonoCompra(abonoCompra : AbonoCompra):Observable<void>{
      
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,abonoCompra, { headers})
    }
    
}
  