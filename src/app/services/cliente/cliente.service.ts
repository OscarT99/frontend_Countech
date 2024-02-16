import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { Cliente } from 'src/app/interfaces/cliente/cliente.interface';
import { Observable } from 'rxjs';

@Injectable()
  export class ClienteService {
    private myAppUrl: string;  
    private myApiUrl: string; 
  
    constructor(private http: HttpClient) { 
      this.myAppUrl = environment.endpoint
      this.myApiUrl = 'api/cliente/'
    }
  
    getCliente(id:number): Observable<Cliente>{
      
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.get<Cliente>(`${this.myAppUrl}${this.myApiUrl}${id}`,{headers})
    }
  
    getListClientes(): Observable<Cliente[]>{
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.get<Cliente[]>(`${this.myAppUrl}${this.myApiUrl}`, { headers})    
    }
      
    postCliente(cliente : Cliente):Observable<void>{
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`, cliente, { headers });
    }
  
    putCliente(id:number,cliente:Cliente):Observable<void>{
      
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,cliente, { headers })
    }
      

    getListClientesPedido(): Observable<{ listClientes: Cliente[] }> {
      
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');

      return this.http.get<{ listClientes: Cliente[] }>(`${this.myAppUrl}${this.myApiUrl}`, { headers });
    }

    buscarClientes(termino: string): Observable<Cliente[]> {

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
      
      const url = `${this.myAppUrl}${this.myApiUrl}buscar?termino=${termino}`;
      return this.http.get<Cliente[]>(url, { headers });
    }
    
  }
  