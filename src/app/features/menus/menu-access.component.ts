import { Component, OnInit } from '@angular/core';

interface MenuItemConfig {
  id: string;
  label: string;
  route: string;
  icon: string;
  section: 'CRM Flow' | 'SaaS Admin';
  order: number;
  tenantSpecific: boolean;
  roles: string[];
  enabled: boolean;
}

@Component({
  selector: 'app-menu-access',
  standalone: false,
  templateUrl: './menu-access.component.html',
  styleUrls: ['./menu-access.component.css']
})
export class MenuAccessComponent implements OnInit {
  menuItems: MenuItemConfig[] = [];
  selectedMenu: MenuItemConfig | null = null;
  activityMessage = '';
  roles = ['Super Admin', 'Admin', 'User'];

  ngOnInit(): void {
    this.menuItems = [
      { id: 'menu-001', label: 'Dashboard', route: '/dashboard', icon: 'fa-chart-line', section: 'CRM Flow', order: 1, tenantSpecific: false, roles: ['Super Admin', 'Admin', 'User'], enabled: true },
      { id: 'menu-002', label: 'Leads', route: '/leads', icon: 'fa-star', section: 'CRM Flow', order: 2, tenantSpecific: true, roles: ['Super Admin', 'Admin', 'User'], enabled: true },
      { id: 'menu-003', label: 'Reports', route: '/reports', icon: 'fa-chart-pie', section: 'CRM Flow', order: 11, tenantSpecific: true, roles: ['Super Admin', 'Admin'], enabled: true },
      { id: 'menu-004', label: 'Organizations', route: '/organizations', icon: 'fa-sitemap', section: 'SaaS Admin', order: 20, tenantSpecific: false, roles: ['Super Admin'], enabled: true },
      { id: 'menu-005', label: 'Plans', route: '/plans', icon: 'fa-layer-group', section: 'SaaS Admin', order: 22, tenantSpecific: false, roles: ['Super Admin'], enabled: true }
    ];
    this.selectedMenu = this.menuItems[0];
  }

  selectMenu(menu: MenuItemConfig): void {
    this.selectedMenu = menu;
  }

  toggleRole(menu: MenuItemConfig, role: string): void {
    menu.roles = menu.roles.includes(role) ? menu.roles.filter((item) => item !== role) : [...menu.roles, role];
  }

  toggleMenu(menu: MenuItemConfig): void {
    menu.enabled = !menu.enabled;
    this.showActivity(`${menu.label} ${menu.enabled ? 'enabled' : 'disabled'}.`);
  }

  move(menu: MenuItemConfig, direction: number): void {
    menu.order = Math.max(1, menu.order + direction);
    this.menuItems = [...this.menuItems].sort((a, b) => a.order - b.order);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 3500);
  }
}
