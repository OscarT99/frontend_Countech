/*
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    // Verificar si hay un token en el almacenamiento local o en las cookies
    const token = this.authService.getToken();

    if (token) {
      // Si hay un token, se puede realizar una verificación adicional aquí (por ejemplo, si el token ha expirado)
      if (this.authService.isValidToken(token)) {
        return true; 
      } else {
        this.router.navigate(['/auth/login']); // Redirigir al usuario al login si el token no es válido
        return false;
      }
    }

    // Si no hay token, redirigir al usuario al login
    this.router.navigate(['/auth/login']);
    return false;
  }
}




// auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';

import { AuthStatus } from '../interfaces/login/login.interface';
import { AuthService } from '../services/login/login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      return this.authService.authStatus.pipe(
        take(1), // to ensure the observable completes after emitting one value
        map(authStatus => {
          if (authStatus === AuthStatus.authenticated || this.retrieveTokenFromStorage()) {
            return true;
          } else {
            // Redirige a la página de inicio de sesión si no está autenticado
            return this.router.createUrlTree(['/login']);
          }
        })
      );
    }

    private retrieveTokenFromStorage(): string | null {
      return localStorage.getItem('token');
    }
  }*/