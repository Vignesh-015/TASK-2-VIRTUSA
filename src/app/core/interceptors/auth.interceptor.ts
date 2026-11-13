import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    const isAuthEndpoint =
      request.url.includes('/auth/login') ||
      request.url.includes('/login') ||
      request.url.includes('/auth/register') ||
      request.url.includes('/register');

    let authReq = request;
    const token = this.authService.getToken();

    // Attach Bearer token to outgoing backend requests, excluding public auth endpoints
    if (isApiUrl && !isAuthEndpoint && token) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && isApiUrl && !isAuthEndpoint) {
          // 401 Unauthorized: clear session and redirect to /login
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: {
              returnUrl: this.router.url,
              sessionExpired: 'true'
            }
          });
        } else if (error.status === 403) {
          // 403 Forbidden: redirect to /forbidden
          this.router.navigate(['/forbidden']);
        }

        return throwError(() => error);
      })
    );
  }
}
