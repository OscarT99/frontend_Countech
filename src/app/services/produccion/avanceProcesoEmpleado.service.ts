import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment'; //Está mal escrito enviroments, debe ser environment
import { AvanceProcesoEmpleado } from 'src/app/interfaces/produccion/avanceProcesoEmpleado.interface';
import { Observable, Subject} from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AvanceProcesoEmpleadoService {
  private _refresh$ = new Subject<void>();
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/avanceproceso/';
  }


  get refresh$(){
    return this._refresh$;
  }

  //getOneAsignarProcesoEmpleado sirve para obtener un proceso asignado a un empleado por su id
  getOneAvanceProcesoEmpleado(id: number): Observable<AvanceProcesoEmpleado> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<AvanceProcesoEmpleado>(`${this.myAppUrl}${this.myApiUrl}${id}`, { headers });
  }

  //getAsignarProcesoEmpleado sirve para obtener todos los procesos asignados a los empleados
  getAvanceProcesoEmpleado(): Observable<AvanceProcesoEmpleado> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.get<AvanceProcesoEmpleado>(`${this.myAppUrl}api/avanceprocesos`, { headers });
  }

  //postEmpleado sirve para crear un empleado
  postAvanceProcesoEmpleado(avanceProcesoEmpleado: AvanceProcesoEmpleado): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`, avanceProcesoEmpleado, { headers })
    .pipe(
      tap(() => {
        this._refresh$.next();
      })
    )
  }


  
  //putEmpleado sirve para actualizar un empleado
  putAvanceProcesoEmpleado(id: number, avanceProcesoEmpleado: AvanceProcesoEmpleado): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-token', token || '');

    return this.http.put<void>(`${this.myAppUrl}${this.myApiUrl}${id}`, avanceProcesoEmpleado, { headers });
  }

  //deleteEmpleado sirve para eliminar un empleado
//   deleteEmpleado(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`);
//   }
}
