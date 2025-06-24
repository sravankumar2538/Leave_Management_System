import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error("Interceptor: 401 Unauthorized detected. Session expired.");
        toastr.error('Your login session has expired. Please log in again.', 'Session Expired', {
          timeOut: 5000,
        });
        router.navigate(['/login'], { queryParams: { expired: true } });
      }
      return throwError(() => error);
    })
  );
};