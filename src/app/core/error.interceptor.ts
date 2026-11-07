import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';

/** Shows the server's message (or a generic one) as a toast on any failed request. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg =
        err.status === 0
          ? 'Serveur injoignable. Vérifiez la connexion.'
          : err.error?.message || 'Une erreur est survenue.';
      toast.error(msg);
      return throwError(() => err);
    }),
  );
};
