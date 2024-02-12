import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment'; //Está mal escrito enviroments, debe ser environment
import { AsignarProcesoEmpleado } from 'src/app/interfaces/produccion/asignarProceso.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class asignarProcesoService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/asignarprocedimiento/';
  }

  //getEmpleado sirve para obtener un empleado por su id
  getAsignarProcedimiento(id: number): Observable<AsignarProcesoEmpleado> {
    return this.http.get<AsignarProcesoEmpleado>(`${this.myAppUrl}${this.myApiUrl}${id}`);
  }

  //getListEmpleados sirve para obtener todos los empleados
  getAsignarProcedimientos(): Observable<AsignarProcesoEmpleado[]> {
    return this.http.get<AsignarProcesoEmpleado[]>(`${this.myAppUrl}${this.myApiUrl}`);
  }

  //postEmpleado sirve para crear un empleado
  postAsignarProcedimiento(asignarProceso: AsignarProcesoEmpleado): Observable<void> {
    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`, asignarProceso);
  }

  //putEmpleado sirve para actualizar un empleado
  putAsignarProcedimiento(id: number, asignarProceso: AsignarProcesoEmpleado): Observable<void> {
    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`, asignarProceso);
  }

  //deleteEmpleado sirve para eliminar un empleado
//   deleteEmpleado(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`);
//   }
}
