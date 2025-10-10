import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
 templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  mobileMenuOpen = false;
  selectedRole: 'organization' | 'employee' | 'bank' = 'organization';

  constructor(private router: Router) {}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  selectRole(role: 'organization' | 'employee' | 'bank') {
    this.selectedRole = role;
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/organization/register']);
  }

  handleAction() {
    if (this.selectedRole === 'organization') {
      this.navigateToRegister();
    } else {
      this.navigateToLogin();
    }
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.mobileMenuOpen = false;
  }

  getRoleContent() {
    const content = {
      organization: {
        title: 'For Organizations',
        features: [
          'Manage employee records and salary structures',
          'Initiate monthly salary disbursals',
          'Handle client and vendor payments',
          'Generate comprehensive reports'
        ]
      },
      employee: {
        title: 'For Employees',
        features: [
          'View detailed salary payment history',
          'Download formatted salary slips as PDF',
          'Update bank account information',
          'Raise concerns with your organization'
        ]
      },
      bank: {
        title: 'For Bank Admins',
        features: [
          'Verify and manage organization records',
          'Approve or reject payment requests',
          'Process salary disbursements',
          'Send automated email notifications'
        ]
      }
    };
    return content[this.selectedRole];
  }
}
