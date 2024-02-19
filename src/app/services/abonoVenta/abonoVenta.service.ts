import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { AbonoVenta } from 'src/app/interfaces/abonoVenta/abonoVenta.interface';
import { Observable } from 'rxjs';

@Injectable()
  export class AbonoVentaService {
    private myAppUrl: string;  
    private myApiUrl: string; 
  
    constructor(private http: HttpClient) { 
      this.myAppUrl = environment.endpoint
      this.myApiUrl = 'api/abonoVenta/'
    }
  
    getAbonoVenta(id:number): Observable<AbonoVenta>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.get<AbonoVenta>(`${this.myAppUrl}${this.myApiUrl}${id}`, { headers})
    }
  
    getListAbonoVentas(): Observable<AbonoVenta[]>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.get<AbonoVenta[]>(`${this.myAppUrl}${this.myApiUrl}`, { headers})    
    }
  
    postAbonoVenta(abonoVenta : AbonoVenta):Observable<void>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,abonoVenta, { headers})
    }
    
}
  