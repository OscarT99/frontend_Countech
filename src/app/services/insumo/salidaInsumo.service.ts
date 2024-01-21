import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/enviroments/environment';
import { SalidaInsumoInstance } from 'src/app/interfaces/insumo/salidaInsumo.interface'; 
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SalidaInsumoService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint
    this.myApiUrl = 'api/salidaInsumo/'
   }

 
   getListSalidaInsumo():Observable<SalidaInsumoInstance[]>{
    return this.http.get<SalidaInsumoInstance[]>(`${this.myAppUrl}${this.myApiUrl}`)
   }

 
   postSalidaInsumo(salidaInsumo: SalidaInsumoInstance):Observable<void>{
    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,salidaInsumo)
   }

}
