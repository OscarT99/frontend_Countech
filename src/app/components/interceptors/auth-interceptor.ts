import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/login/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private sessionExpiredMessageShown = false;
    private pageReloaded = false; 

    constructor(private router: Router, 
                private authService: AuthService,
                private toastr: ToastrService
            ) { }
        

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // Aquí puedes realizar acciones después de recibir una respuesta exitosa
                }
            }, (error: any) => {
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 401 && !this.sessionExpiredMessageShown) {
                        // Mostrar SweetAlert de carga this.authService.logout();
                            // Si la página no ha sido recargada antes, recargarla
                            this.authService.logout();
                            this.toastr.error('Su sesión ha expirado. Por favor, inicie sesión de nuevo.');
                            if (!this.pageReloaded) {
                                this.pageReloaded = true;
                                //window.location.reload();
                            } else {
                                // Si ya se ha recargado una vez, redirigir al login
                                this.router.navigate(['/auth/login']);
                            } this.sessionExpiredMessageShown = true;
                    }
                }
            })
        );
    }
}