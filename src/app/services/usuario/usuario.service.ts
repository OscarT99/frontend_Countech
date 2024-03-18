import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { Usuario } from 'src/app/interfaces/usuario/usuario.interface';
import { Observable } from 'rxjs';

@Injectable()
  export class UsuarioService {
    private myAppUrl: string;  
    private myApiUrl: string; 
  
    constructor(private http: HttpClient) { 
      this.myAppUrl = environment.endpoint
      this.myApiUrl = 'api/usuario/'
    }
  
    getUsuario(id:number): Observable<Usuario>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
      
      return this.http.get<Usuario>(`${this.myAppUrl}${this.myApiUrl}${id}`, { headers })
    }
  
    getListUsuarios(): Observable<Usuario[]>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
      
      return this.http.get<Usuario[]>(`${this.myAppUrl}${this.myApiUrl}`, {headers})    
    }
  
    postUsuario(usuario : Usuario):Observable<void>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
      
      return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`,usuario, {headers})
    }
  
    putUsuario(id:number,usuario:Usuario):Observable<void>{

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('x-token', token || '');
      
      return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`,usuario, {headers})
    }
    
  }
  