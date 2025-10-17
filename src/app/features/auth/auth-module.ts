import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing-module';
import { LoginComponent } from './login/login'; 
// Note: RegisterComponent is missing, assuming it exists for /auth/register

@NgModule({
  declarations: [
    LoginComponent,
    // Assuming RegisterComponent is also declared here
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule
    // Removed LoginComponent from imports as it is now declared
  ]
})
export class AuthModule {}
