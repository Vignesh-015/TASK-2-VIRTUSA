import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppLayoutComponent }    from './layout/app-layout/app-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { NotFoundComponent }     from './pages/not-found/not-found.component';
import { ForbiddenComponent }    from './pages/forbidden/forbidden.component';

import { authGuard, authChildGuard } from './core/guards/auth.guard';
import { guestGuard }                from './core/guards/guest.guard';
import { roleMatchGuard }            from './core/guards/role.guard';

const routes: Routes = [
  // Default redirect – send bare "/" straight to the dashboard
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Public pages (login, register) use the minimal centred layout
  // guestGuard ensures logged-in users are redirected straight to /dashboard
  {
    path: 'auth',
    component: PublicLayoutComponent,
    canActivate: [guestGuard],
    canActivateChild: [guestGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.module').then(m => m.AuthModule)
      }
    ]
  },

  // Protected pages share the top-bar + sidebar shell
  // canActivate and canActivateChild protect the parent shell and every child route
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'reports',
        // canMatch is used here so the lazy chunk bundle is not even downloaded if the user role is not ADMIN,
        // whereas canActivate runs after the route is matched and module chunk is fetched.
        canMatch: [roleMatchGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () =>
          import('./features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'forbidden',
        component: ForbiddenComponent
      }
    ]
  },

  // 404 – must be last
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
