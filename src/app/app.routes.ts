// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home/home';
import { RegisterOrganization } from './features/organization/registerOrganization/register-organization/register-organization';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'organization/register', component: RegisterOrganization },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'organization',
    loadChildren: () =>
      import('./features/organization/organization-module').then(m => m.OrganizationModule)
  },
  {
    path: 'bank-admin',
    loadChildren: () =>
      import('./features/bank-admin/bank-admin-module').then(m => m.BankAdminModule)
  },
  {
    path: 'employee',
    loadChildren: () =>
      import('./features/employee/employee-module').then(m => m.EmployeeModule)
  },
  { path: '**', redirectTo: 'auth/login' } // fallback route
];
