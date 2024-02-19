import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment'; //Está mal escrito enviroments, debe ser environment
import { AvanceProcesoEmpleado } from 'src/app/interfaces/produccion/avanceProcesoEmpleado.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvanceProcesoEmpleadoService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/avanceproceso/';
  }

  //getOneAsignarProcesoEmpleado sirve para obtener un proceso asignado a un empleado por su id
  getOneAvanceProcesoEmpleado(id: number): Observable<AvanceProcesoEmpleado> {
    return this.http.get<AvanceProcesoEmpleado>(`${this.myAppUrl}${this.myApiUrl}${id}`);
  }

  //getAsignarProcesoEmpleado sirve para obtener todos los procesos asignados a los empleados
  getAvanceProcesoEmpleado(): Observable<AvanceProcesoEmpleado> {
    return this.http.get<AvanceProcesoEmpleado>(`http://localhost:8083/api/avanceprocesos`);
  }

  //postEmpleado sirve para crear un empleado
  postAvanceProcesoEmpleado(avanceProcesoEmpleado: AvanceProcesoEmpleado): Observable<void> {
    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`, avanceProcesoEmpleado);
  }

  //putEmpleado sirve para actualizar un empleado
  putAvanceProcesoEmpleado(id: number, avanceProcesoEmpleado: AvanceProcesoEmpleado): Observable<void> {
    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`, avanceProcesoEmpleado);
  }

  //deleteEmpleado sirve para eliminar un empleado
//   deleteEmpleado(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`);
//   }
}
