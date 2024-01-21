import { HttpClient } from '@angular/common/http';
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
      return this.http.get<AbonoVenta>(`${this.myAppUrl}${this.myApiUrl}${id}`)
    }
  
    getListAbonoVentas(): Observable<AbonoVenta[]>{
      return this.http.get<AbonoVenta[]>(`${this.myAppUrl}${this.myApiUrl}`)    
    }
  
    postAbonoVenta(abonoVenta : AbonoVenta):Observable<void>{
      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,abonoVenta)
    }
    
}
  