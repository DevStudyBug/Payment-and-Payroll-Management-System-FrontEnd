import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrgRegister } from '../models/org-register.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  private baseUrl = 'http://localhost:8080/api/v1/auth'; // ✅ match backend prefix

  constructor(private http: HttpClient) {}

  registerOrganization(data: OrgRegister): Observable<any> {
    return this.http.post(`${this.baseUrl}/org-register`, data);
  }
}