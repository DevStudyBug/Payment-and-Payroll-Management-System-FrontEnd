import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // Import HTTP_INTERCEPTORS

// Import all services and the class-based interceptor
import { AuthService } from './services/auth-service';
import { OrganizationService } from './services/organization-service';
import { BankAdminService } from './services/bank-admin-service';
import { DocumentService } from './services/document-service';
import { EmployeeService } from './services/employee-service';
import { JwtInterceptor } from './interceptors/jwt-interceptor';

@NgModule({
  imports: [
    CommonModule, 
    HttpClientModule
  ],
  providers: [
    // Providers resolve NG2003 for services
    AuthService,
    OrganizationService,
    BankAdminService,
    DocumentService,
    EmployeeService,
    
    // Provides class-based interceptor (Resolves NG2005)
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }, 
  ],
  exports: [
    HttpClientModule
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule.');
    }
  }
}
