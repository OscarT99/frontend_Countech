import { Injectable, numberAttribute } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<Proveedor>(`${this.myAppUrl}${this.myApiUrl}${id}`)
  }

  getListProveedores():Observable<Proveedor[]>{
    return this.http.get<Proveedor[]>(`${this.myAppUrl}${this.myApiUrl}`)
  }

  postProveedor(proveedor: Proveedor):Observable<void>{
    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,proveedor)
  }

  putProveedor(id:number,proveedor:Proveedor):Observable<void>{
    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,proveedor)
  }


  buscarProveedores(termino: string): Observable<Proveedor[]> {
    const url = `${this.myAppUrl}${this.myApiUrl}buscar?termino=${termino}`;
    return this.http.get<Proveedor[]>(url);
  }

  getListProveedoresCompra(): Observable<{ listProveedores: Proveedor[] }> {
    return this.http.get<{ listProveedores: Proveedor[] }>(`${this.myAppUrl}${this.myApiUrl}`);
  }
}
