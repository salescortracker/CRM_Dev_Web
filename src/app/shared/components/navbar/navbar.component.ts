import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = true; // Set to true for demo
  sidebarCollapsed = false;
  isDark = false;

  currentUser: any = {
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
  };

  menuItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'fa-chart-line', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Leads', route: '/leads', icon: 'fa-star', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Contacts', route: '/contacts', icon: 'fa-users', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Companies', route: '/companies', icon: 'fa-building', roles: ['admin', 'super-admin'] },
    { label: 'Deals', route: '/deals', icon: 'fa-handshake', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Pipeline', route: '/pipeline', icon: 'fa-stream', roles: ['admin', 'super-admin'] },
    { label: 'Tasks', route: '/tasks', icon: 'fa-tasks', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Activity', route: '/activity', icon: 'fa-list', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Lead Sources', route: '/lead-sources', icon: 'fa-filter-circle-dollar', roles: ['admin', 'super-admin'] },
    { label: 'Workflows', route: '/workflows', icon: 'fa-diagram-project', roles: ['admin', 'super-admin'] },
    { label: 'Calendar', route: '/calendar-integrations', icon: 'fa-calendar-days', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Email', route: '/email-management', icon: 'fa-envelope-open-text', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Telephony', route: '/telephony', icon: 'fa-phone-volume', roles: ['admin', 'super-admin', 'user'] },
    { label: 'WhatsApp/SMS', route: '/messaging', icon: 'fa-message', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Campaigns', route: '/campaigns', icon: 'fa-bullhorn', roles: ['admin', 'super-admin'] },
    { label: 'Engagement', route: '/engagement', icon: 'fa-comments', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Support', route: '/support-tickets', icon: 'fa-life-ring', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Notifications', route: '/notifications', icon: 'fa-bell', roles: ['admin', 'super-admin', 'user'] },
    { label: 'Approvals', route: '/approval-workflows', icon: 'fa-clipboard-check', roles: ['admin', 'super-admin'] },
    { label: 'Reports', route: '/reports', icon: 'fa-chart-pie', roles: ['admin', 'super-admin'] },
  ];

  adminMenuItems = [
    { label: 'Organizations', route: '/organizations', icon: 'fa-sitemap', roles: ['super-admin'] },
    { label: 'Subscriptions', route: '/subscriptions', icon: 'fa-credit-card', roles: ['super-admin'] },
    { label: 'Plans', route: '/plans', icon: 'fa-layer-group', roles: ['super-admin'] },
    { label: 'Roles', route: '/roles', icon: 'fa-user-lock', roles: ['super-admin'] },
    { label: 'Menu Access', route: '/menus', icon: 'fa-bars-staggered', roles: ['super-admin'] },
    { label: 'CRM Config', route: '/crm-config', icon: 'fa-sliders', roles: ['super-admin'] },
    { label: 'Integrations', route: '/integrations', icon: 'fa-plug', roles: ['admin', 'super-admin'] },
    { label: 'API & Webhooks', route: '/api-webhooks', icon: 'fa-code-branch', roles: ['admin', 'super-admin'] },
    { label: 'Security', route: '/security-compliance', icon: 'fa-shield-halved', roles: ['super-admin'] },
    { label: 'Login Sessions', route: '/login-sessions', icon: 'fa-desktop', roles: ['admin', 'super-admin'] },
    { label: 'AI Settings', route: '/ai-automation-settings', icon: 'fa-robot', roles: ['admin', 'super-admin'] },
    { label: 'Master Data', route: '/master-data', icon: 'fa-table-list', roles: ['super-admin'] },
    { label: 'Audit Logs', route: '/audit-logs', icon: 'fa-clipboard-list', roles: ['super-admin'] },
    { label: 'Backup', route: '/backup-recovery', icon: 'fa-database', roles: ['super-admin'] },
    { label: 'Users', route: '/users', icon: 'fa-user-shield', roles: ['super-admin'] }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  shouldShowMenu(item: any): boolean {
    return this.authService.hasAnyRole(item.roles);
  }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadTheme();
    this.applySidebarState();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.applySidebarState();
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme();
  }

  get userInitials(): string {
    return `${this.currentUser?.firstName?.[0] || ''}${this.currentUser?.lastName?.[0] || ''}`.toUpperCase() || 'U';
  }

  private checkAuthStatus(): void {
    // Only check authentication status on browser platform
    if (isPlatformBrowser(this.platformId) && this.authService) {
      // Subscribe to auth changes - this is the source of truth
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        if (user) {
          this.currentUser = user;
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    // Navigate after a small delay to ensure auth state is updated
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 100);
  }

  private applySidebarState(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
    }
  }

  private loadTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isDark = localStorage.getItem('crm-theme') === 'dark';
    this.applyTheme();
  }

  private applyTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.toggle('dark', this.isDark);
      localStorage.setItem('crm-theme', this.isDark ? 'dark' : 'light');
    }
  }
}
