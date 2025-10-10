import { Routes } from '@angular/router';
import { HomeComponent } from './features/home-component/home-component';
import { RegisterOrganization } from './features/auth/register-organization/register-organization';
import { LoginComponent } from './features/auth/login-component/login-component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'organization/register', component: RegisterOrganization },
  { path: 'auth/login', component: LoginComponent },
  { path: '**', redirectTo: 'home' }
];
