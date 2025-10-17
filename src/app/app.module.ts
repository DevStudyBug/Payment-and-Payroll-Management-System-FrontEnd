// src/app/app.module.ts (Applies CoreModule and declares routed components)
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouterOutlet } from '@angular/router'; // RouterOutlet needed for app.component.ts template
 
import { routes } from './app.routes'; 


// Components used directly in app.routes MUST be declared here
import { HomeComponent } from './features/home/home/home'; 
import { RegisterOrganization } from './features/organization/registerOrganization/register-organization/register-organization'; 

// Feature modules
import { AuthModule } from './features/auth/auth-module';
import { BankAdminModule } from './features/bank-admin/bank-admin-module';
import { EmployeeModule } from './features/employee/employee-module';
import { OrganizationModule } from './features/organization/organization-module';
import { App } from './app';
import { CoreModule } from './core/core-module';

@NgModule({
  declarations: [ // 👈 Declare ALL root components
    App, 
    HomeComponent, 
    RegisterOrganization
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes), // Resolves NG1010/Router dependencies
    CoreModule, // Resolves NG2003/HttpClient dependencies
    AuthModule,
    BankAdminModule,
    EmployeeModule,
    OrganizationModule,
    RouterOutlet // Needed for App component template
  ],
  bootstrap: [App]
})
export class AppModule {}
