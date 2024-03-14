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
import { AuthGuard } from '../../guards/auth.guard';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private sessionExpiredMessageShown = false;

    constructor(private router: Router, private toastr: ToastrService, private authGuard: AuthGuard) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // Aquí puedes realizar acciones después de recibir una respuesta exitosa
                }
            }, (error: any) => {
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 401 && !this.sessionExpiredMessageShown) {
                        // Mostrar el mensaje de error solo una vez
                        this.toastr.error('Su sesión ha expirado. Por favor, inicie sesión de nuevo.');
                        this.sessionExpiredMessageShown = true;
                        this.router.navigate(['/auth/login']);
                        this.authGuard.canActivate()
                    }
                }
            })
        );
    }
}
