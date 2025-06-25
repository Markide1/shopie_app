import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

export const HttpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        router.navigate(['/login']);
      }
      
      const message = error.error?.message || 'An error occurred';
      notificationService.show(message, 'error');
      
      return throwError(() => error);
    })
  );
};