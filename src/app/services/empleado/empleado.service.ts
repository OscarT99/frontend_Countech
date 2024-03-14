import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment'; //Está mal escrito enviroments, debe ser environment
import { Empleado } from 'src/app/interfaces/empleado/empleado.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/empleado/';
  }

  // getEmpleadoProcesos sirve para obtener los empleados junto con sus procesos
  getEmpleadoProcesos(): Observable<Empleado> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<Empleado>(`${this.myAppUrl}api/empleado/proceso`, { headers })
  }

  //getListEmpleados sirve para obtener todos los empleados
  getEmpleadoList(): Observable<Empleado> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<Empleado>(`${this.myAppUrl}api/empleados`,  { headers });
  }

  //getEmpleado sirve para obtener un empleado por su id
  getEmpleado(id: number): Observable<Empleado> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<Empleado>(`${this.myAppUrl}${this.myApiUrl}${id}`, { headers });
  }


  //postEmpleado sirve para crear un empleado
  postEmpleado(empleado: Empleado): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`, empleado, { headers });
  }

  //putEmpleado sirve para actualizar un empleado
  putEmpleado(id: number, empleado: Empleado): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`, empleado, { headers });
  }

  putEstadoEmpleado(id: number, empleado: Empleado): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}/estado/${id}`, empleado, { headers });
  }


}
