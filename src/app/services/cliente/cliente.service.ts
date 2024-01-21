import { HttpClient } from '@angular/common/http';
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
      return this.http.get<Cliente>(`${this.myAppUrl}${this.myApiUrl}${id}`)
    }
  
    getListClientes(): Observable<Cliente[]>{
      return this.http.get<Cliente[]>(`${this.myAppUrl}${this.myApiUrl}`)    
    }
      
    postCliente(cliente : Cliente):Observable<void>{
      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,cliente)
    }
  
    putCliente(id:number,cliente:Cliente):Observable<void>{
      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,cliente)
    }
      

    getListClientesPedido(): Observable<{ listClientes: Cliente[] }> {
      return this.http.get<{ listClientes: Cliente[] }>(`${this.myAppUrl}${this.myApiUrl}`);
    }

    buscarClientes(termino: string): Observable<Cliente[]> {
      const url = `${this.myAppUrl}${this.myApiUrl}buscar?termino=${termino}`;
      return this.http.get<Cliente[]>(url);
    }
    
  }
  