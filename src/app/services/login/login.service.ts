import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/enviroments/environment';
import { AuthStatus, User } from 'src/app/interfaces/login/login.interface';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userSessionStorageKey = "currentUser";
  private _currentUser: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(this.retrieveUserFromStorage());
  currentUser: Observable<User | null> = this._currentUser.asObservable();
  private _authStatus: BehaviorSubject<AuthStatus> =
    new BehaviorSubject<AuthStatus>(this.retrieveAuthStatusFromStorage());
  authStatus: Observable<AuthStatus> = this._authStatus.asObservable();

  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient, private router: Router) {
    this.myAppUrl = environment.endpoint
    this.myApiUrl = 'api/auth/login'
  }



  login(email: string, contrasena: string): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}`, { email, contrasena }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  logout() {
    console.log('Logging out...');
    this._currentUser.next(null);
    this._authStatus.next(AuthStatus.notAuthenticated);


    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authStatus');

    this.router.navigate(['/auth/login']);
  }

  getUser() {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      const { id, nombre, email, cedula } = user;
      return { id, nombre, email, cedula }; // Devolver solo las propiedades necesarias
    } else {
      return null; // Devolver null si no hay usuario almacenado en el almacenamiento local
    }
  }


  private retrieveUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  private retrieveAuthStatusFromStorage(): AuthStatus {
    const authStatus = localStorage.getItem('authStatus');
    return authStatus ? (authStatus as AuthStatus) : AuthStatus.checking;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }


  isValidToken(token: string): boolean {
    return !!token;
  }
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }




  //Recuperar contraseña
  public verificarCorreoExistente(email: string, token?: string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const verificarCorreo = `${this.myApiUrl}-email?email=${email}`;
    return this.http.get<any>(verificarCorreo, { headers });
  }


  public changePassword(token: string, newPassword: string): Observable<any> {
    const createUrl = `http://localhost:8083/api/auth/cambiar-contrasena/${token}`  //'cambiar-contrasena/:token';
    const user = { newPassword };  // Puedes ajustar la estructura del objeto según sea necesario
    return this.http.post(createUrl, user);
  }

  public forgotPassword(email: any): Observable<any> {
    const createUrl = 'http://localhost:8083/api/auth/recuperar';
    return this.http.post(createUrl, email);
  }

}
