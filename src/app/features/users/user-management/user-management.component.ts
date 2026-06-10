import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

type UserRole = 'super-admin' | 'admin' | 'user';

interface CrmUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  phone: string;
  active: boolean;
  permissionGroup: string;
  ownedDeals: number;
  openTasks: number;
  pipelineValue: number;
}

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: CrmUser[] = [];
  selectedUser: CrmUser | null = null;
  newUser: Partial<CrmUser> = {};
  editingUserId?: string;
  activityMessage = '';
  detailMode = false;
  showUserPanel = false;
  panelPosition = { x: 0, y: 0 };
  private isDraggingPanel = false;
  private dragOffset = { x: 0, y: 0 };

  roles: UserRole[] = ['super-admin', 'admin', 'user'];
  permissionGroups = ['Executive Admin', 'Sales Manager', 'Sales Rep', 'Read Only'];

  fieldAccessOptions = [
    { label: 'Can edit deal amount', value: 'editDealAmount', enabled: true },
    { label: 'Can change pipeline stage', value: 'changePipelineStage', enabled: true },
    { label: 'Can access sales credit review', value: 'creditReviewAccess', enabled: true },
    { label: 'Can change contact ownership', value: 'changeContactOwner', enabled: false }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users = [
      { id: 'user-0', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'super-admin', department: 'Operations', phone: '+1 555-100-0000', active: true, permissionGroup: 'Executive Admin', ownedDeals: 8, openTasks: 4, pipelineValue: 380000 },
      { id: 'user-1', email: 'rohit.kumar@example.com', firstName: 'Rohit', lastName: 'Kumar', role: 'admin', department: 'Sales', phone: '+1 555-100-1001', active: true, permissionGroup: 'Sales Manager', ownedDeals: 2, openTasks: 2, pipelineValue: 122000 },
      { id: 'user-2', email: 'jane.doe@example.com', firstName: 'Jane', lastName: 'Doe', role: 'user', department: 'Sales', phone: '+1 555-100-1002', active: true, permissionGroup: 'Sales Rep', ownedDeals: 2, openTasks: 1, pipelineValue: 56000 },
      { id: 'user-4', email: 'maria.lopez@example.com', firstName: 'Maria', lastName: 'Lopez', role: 'user', department: 'Solutions', phone: '+1 555-100-1004', active: true, permissionGroup: 'Sales Rep', ownedDeals: 2, openTasks: 2, pipelineValue: 100000 },
      { id: 'user-5', email: 'nate.hill@example.com', firstName: 'Nate', lastName: 'Hill', role: 'user', department: 'Customer Success', phone: '+1 555-100-1005', active: false, permissionGroup: 'Read Only', ownedDeals: 1, openTasks: 1, pipelineValue: 64000 }
    ];
    this.selectedUser = this.users[0];
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((user) => user.active).length;
  }

  get adminUsers(): number {
    return this.users.filter((user) => user.role === 'admin' || user.role === 'super-admin').length;
  }

  get totalOpenTasks(): number {
    return this.users.reduce((sum, user) => sum + user.openTasks, 0);
  }

  selectUser(user: CrmUser): void {
    this.selectedUser = user;
    this.detailMode = true;
    this.showUserPanel = false;
  }

  closeUserProfile(): void {
    this.detailMode = false;
  }

  openAddUserPanel(): void {
    this.resetForm();
    this.showUserPanel = true;
    this.resetPanelPosition();
  }

  closeUserPanel(): void {
    this.showUserPanel = false;
    this.resetForm();
  }

  saveUser(): void {
    if (!this.newUser.email || !this.newUser.firstName || !this.newUser.role) {
      this.showActivity('Please fill required user fields.');
      return;
    }

    const user: CrmUser = {
      id: `user-${Date.now()}`,
      email: this.newUser.email,
      firstName: this.newUser.firstName,
      lastName: this.newUser.lastName || '',
      role: this.newUser.role,
      department: this.newUser.department || 'Sales',
      phone: this.newUser.phone || '',
      active: true,
      permissionGroup: this.newUser.permissionGroup || 'Sales Rep',
      ownedDeals: 0,
      openTasks: 0,
      pipelineValue: 0
    };
    this.users.unshift(user);
    this.selectedUser = user;
    this.detailMode = true;
    this.showUserPanel = false;
    this.resetForm();
    this.showActivity('User added.');
  }

  editUser(user: CrmUser): void {
    this.newUser = { ...user };
    this.editingUserId = user.id;
    this.selectedUser = user;
    this.showUserPanel = true;
    this.resetPanelPosition();
  }

  updateUser(): void {
    if (!this.editingUserId) {
      return;
    }
    const index = this.users.findIndex((user) => user.id === this.editingUserId);
    if (index >= 0) {
      this.users[index] = { ...this.users[index], ...this.newUser, id: this.editingUserId } as CrmUser;
      this.selectedUser = this.users[index];
      this.detailMode = true;
      this.showUserPanel = false;
      this.showActivity('User updated.');
    }
    this.resetForm();
  }

  toggleUser(user: CrmUser): void {
    user.active = !user.active;
    this.selectedUser = user;
    this.showActivity(`${user.firstName} ${user.lastName} ${user.active ? 'activated' : 'deactivated'}.`);
  }

  assignPermissionGroup(user: CrmUser, group: string): void {
    user.permissionGroup = group;
    this.selectedUser = user;
    this.showActivity(`${group} assigned to ${user.firstName}.`);
  }

  deleteUser(id: string): void {
    this.users = this.users.filter((user) => user.id !== id);
    this.selectedUser = this.users[0] || null;
    this.showActivity('User removed from demo list.');
  }

  resetForm(): void {
    this.newUser = {};
    this.editingUserId = undefined;
  }

  openDeals(): void {
    this.router.navigate(['/deals']);
  }

  openTasks(): void {
    this.router.navigate(['/tasks']);
  }

  getRoleClass(role: UserRole): string {
    return `role-${role}`;
  }

  getInitials(user: CrmUser): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getPanelStyle(): { [key: string]: string } {
    return {
      left: `${this.panelPosition.x}px`,
      top: `${this.panelPosition.y}px`
    };
  }

  startPanelDrag(event: MouseEvent | TouchEvent): void {
    const point = this.getPointerPoint(event);
    this.isDraggingPanel = true;
    this.dragOffset = {
      x: point.x - this.panelPosition.x,
      y: point.y - this.panelPosition.y
    };
    event.preventDefault();
  }

  onPanelDrag(event: MouseEvent | TouchEvent): void {
    if (!this.isDraggingPanel) {
      return;
    }

    const point = this.getPointerPoint(event);
    const panelWidth = 430;
    const panelHeight = 520;
    const maxX = Math.max(12, window.innerWidth - panelWidth - 12);
    const maxY = Math.max(12, window.innerHeight - panelHeight - 12);

    this.panelPosition = {
      x: Math.min(Math.max(12, point.x - this.dragOffset.x), maxX),
      y: Math.min(Math.max(12, point.y - this.dragOffset.y), maxY)
    };
  }

  stopPanelDrag(): void {
    this.isDraggingPanel = false;
  }

  private resetPanelPosition(): void {
    this.panelPosition = {
      x: Math.max(12, window.innerWidth - 458),
      y: 118
    };
  }

  private getPointerPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if ('touches' in event && event.touches.length) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }

    if ('changedTouches' in event && event.changedTouches.length) {
      return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    }

    return { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
