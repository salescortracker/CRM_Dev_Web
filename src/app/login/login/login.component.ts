import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  // Test credentials for different roles
  private testUsers = [
    {
      email: 'superadmin@crm.com',
      password: 'superadmin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super-admin',
      permissions: ['manage-users', 'manage-settings', 'view-reports', 'manage-all']
    },
    {
      email: 'admin@crm.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      permissions: ['manage-contacts', 'manage-deals', 'manage-leads', 'manage-companies']
    },
    {
      email: 'user@crm.com',
      password: 'user123',
      firstName: 'Normal',
      lastName: 'User',
      role: 'user',
      permissions: ['view-contacts', 'view-deals', 'manage-leads', 'add-leads']
    }
  ];

  login() {
    this.loading = true;
    this.errorMessage = '';

    // Find user by email and password
    const foundUser = this.testUsers.find(
      user => user.email === this.username && user.password === this.password
    );

    if (foundUser) {
      const mockToken = 'dummy-token-' + Date.now();
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role,
        permissions: foundUser.permissions
      };
      
      // Set localStorage and update auth service
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Update the auth service's BehaviorSubject to trigger navbar update
      this.authService.setCurrentUser(userData);
      this.loading = false;
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid email or password. Please check your credentials.';
      this.loading = false;
    }
  }

}
