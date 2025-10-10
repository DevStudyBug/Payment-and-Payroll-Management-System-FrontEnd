import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard-component',
  standalone: true,
  imports: [CommonModule],

  templateUrl: './admin-dashboard-component.html',
  styleUrl: './admin-dashboard-component.css'
})

export class AdminDashboardComponent implements OnInit {
  userEmail: string = '';
  userId: number = 0;
  userRoles: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.userEmail = userInfo.email;
      this.userId = userInfo.userId;
      this.userRoles = userInfo.roles;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}