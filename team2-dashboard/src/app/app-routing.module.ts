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
  // Default redirect – send bare "/" to dashboard
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Public authentication routes (login)
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

  // Protected application routes sharing the topbar + collapsible sidebar layout
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'dashboard',
        canMatch: [roleMatchGuard],
        data: { roles: ['ADMIN', 'HR'] },
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'employees',
        canMatch: [roleMatchGuard],
        data: { roles: ['ADMIN', 'HR'] },
        loadChildren: () =>
          import('./features/employees/employees.module').then(m => m.EmployeesModule)
      },
      {
        path: 'departments',
        canMatch: [roleMatchGuard],
        data: { roles: ['ADMIN', 'HR'] },
        loadChildren: () =>
          import('./features/departments/departments.module').then(m => m.DepartmentsModule)
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'forbidden',
        component: ForbiddenComponent
      }
    ]
  },

  // 404 handler
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
