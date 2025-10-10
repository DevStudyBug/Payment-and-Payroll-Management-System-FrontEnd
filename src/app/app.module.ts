// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes'; // ✅ import your routes here

// Feature modules
import { AuthModule } from './features/auth/auth-module';
import { BankAdminModule } from './features/bank-admin/bank-admin-module';
import { EmployeeModule } from './features/employee/employee-module';
import { OrganizationModule } from './features/organization/organization-module';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes), // ✅ use the imported routes
    AuthModule,
    BankAdminModule,
    EmployeeModule,
    OrganizationModule
  ],
  bootstrap: [App]
})
export class AppModule {}
