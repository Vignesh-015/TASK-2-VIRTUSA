import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * authGuard protects routes that require an authenticated user.
 * If the user is logged in (valid token that is not expired), navigation proceeds.
 * Otherwise, redirects to /auth/login with the intended URL in returnUrl query parameter.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to login page and preserve returnUrl
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};

/**
 * Child route protection variant of authGuard.
 */
export const authChildGuard: CanActivateChildFn = (childRoute, state) => {
  return authGuard(childRoute, state);
};
