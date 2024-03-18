import { Injectable, numberAttribute } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/environment';
import { Proveedor } from 'src/app/interfaces/proveedor/proveedor.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint
    this.myApiUrl = 'api/proveedor/'
  }

  getProveedor(id:number):Observable<Proveedor>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');
      
    return this.http.get<Proveedor>(`${this.myAppUrl}${this.myApiUrl}${id}`, {headers})
  }

  getListProveedores():Observable<Proveedor[]>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');
      
    return this.http.get<Proveedor[]>(`${this.myAppUrl}${this.myApiUrl}`, {headers})
  }

  postProveedor(proveedor: Proveedor):Observable<void>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');
      
    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,proveedor, {headers})
  }

  putProveedor(id:number,proveedor:Proveedor):Observable<void>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');
      
    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,proveedor, {headers})
  }


  buscarProveedores(termino: string): Observable<Proveedor[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');
      
    const url = `${this.myAppUrl}${this.myApiUrl}buscar?termino=${termino}`;

    const options = { headers: headers };

    return this.http.get<Proveedor[]>(url,options);
  }

  getListProveedoresCompra(): Observable<{ listProveedores: Proveedor[] }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');
      
    return this.http.get<{ listProveedores: Proveedor[] }>(`${this.myAppUrl}${this.myApiUrl}`, { headers});
  }
}
