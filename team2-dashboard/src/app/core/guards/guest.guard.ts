import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * guestGuard prevents logged-in users from accessing public authentication pages (login/register).
 * Redirects them to /dashboard or /profile depending on their role.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    if (authService.currentRole === 'EMPLOYEE') {
      return router.createUrlTree(['/profile']);
    }
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
