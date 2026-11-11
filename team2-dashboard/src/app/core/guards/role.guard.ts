import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * roleGuard checks whether the authenticated user has one of the allowed roles
 * specified on the route configuration (e.g. data: { roles: ['ADMIN', 'HR'] }).
 * If the user's role does not match, they are redirected to /forbidden.
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as string[]) || [];
  const currentUser = authService.currentUser;

  // If no roles specified, grant access
  if (allowedRoles.length === 0) {
    return true;
  }

  if (currentUser && allowedRoles.includes(currentUser.role)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

/**
 * roleMatchGuard prevents route matching and lazy module downloading
 * when the user doesn't possess the required role clearance.
 */
export const roleMatchGuard: CanMatchFn = (route: Route, _segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as string[]) || [];
  const currentUser = authService.currentUser;

  if (allowedRoles.length === 0) {
    return true;
  }

  if (currentUser && allowedRoles.includes(currentUser.role)) {
    return true;
  }

  // Redirect to /forbidden
  return router.createUrlTree(['/forbidden']);
};
