import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment'; //Está mal escrito enviroments, debe ser environment
import { AsignarProcesoEmpleado, EstadoAnular } from 'src/app/interfaces/produccion/asignarProceso.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsignarProcesoService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/asignarproceso/';
  }

  //getOneAsignarProcesoEmpleado sirve para obtener un proceso asignado a un empleado por su id
  getOneAsignarProcesoEmpleado(id: number): Observable<AsignarProcesoEmpleado> {
    return this.http.get<AsignarProcesoEmpleado>(`${this.myAppUrl}${this.myApiUrl}${id}`);
  }

  //getAsignarProcesoEmpleado sirve para obtener todos los procesos asignados a los empleados
  getAsignarProcesoEmpleado(): Observable<AsignarProcesoEmpleado> {
    return this.http.get<AsignarProcesoEmpleado>(`${this.myAppUrl}api/asignarprocesos`);
  }

  getProcesoAvance(): Observable<AsignarProcesoEmpleado> {
    return this.http.get<AsignarProcesoEmpleado>(`${this.myAppUrl}${this.myApiUrl}avance`);
  }

  //postEmpleado sirve para crear un empleado
  postAsignarProcesoEmpleado(asignarProceso: AsignarProcesoEmpleado): Observable<void> {
    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`, asignarProceso);
  }

  //putEmpleado sirve para actualizar un empleado
  putAsignarProcedimiento(id: number, asignarProceso: AsignarProcesoEmpleado): Observable<void> {
    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`, asignarProceso);
  }

  putAnularProceso(id: number, estadoAnular: EstadoAnular): Observable<any>{
    return this.http.put<void>(`${this.myAppUrl}api/anularprocesoasignado/${id}`, estadoAnular);
  }

  //deleteEmpleado sirve para eliminar un empleado
//   deleteEmpleado(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`);
//   }
}
