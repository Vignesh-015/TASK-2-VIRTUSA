import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * roleGuard checks whether the authenticated user has one of the allowed roles
 * specified on the route configuration (e.g. data: { roles: ['ADMIN'] }).
 * If the user's role does not match, they are redirected to /forbidden.
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as string[]) || [];
  const currentUser = authService.currentUser;

  if (currentUser && allowedRoles.includes(currentUser.role)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

/**
 * roleMatchGuard prevents matching (and therefore lazy chunk downloading)
 * for unauthorized users on lazy-loaded modules.
 */
export const roleMatchGuard: CanMatchFn = (route: Route, _segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as string[]) || [];
  const currentUser = authService.currentUser;

  if (currentUser && allowedRoles.includes(currentUser.role)) {
    return true;
  }

  // If role is insufficient or user is not logged in, redirect to forbidden
  return router.createUrlTree(['/forbidden']);
};
