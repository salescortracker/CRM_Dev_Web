import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import {
  Briefcase,
  Check,
  Crown,
  Info,
  Key,
  Layers,
  Pencil,
  Plus,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCog,
  LucideIconData
} from 'lucide-angular';

type RoleStatus = 'Active' | 'Draft';
type Action = 'create' | 'view' | 'edit' | 'delete';
type RoleIcon = 'shield' | 'crown' | 'briefcase' | 'usercog' | 'sparkles';

interface Perm {
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  users: number;
  icon: RoleIcon;
  permissions: Record<string, Perm>;
}

interface Screen {
  id: string;
  label: string;
}

interface ModuleGroup {
  module: string;
  screens: Screen[];
}

interface RoleForm {
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  icon: RoleIcon;
}

const ACTIONS: Action[] = ['create', 'view', 'edit', 'delete'];
const ACTION_ABBR: Record<Action, string> = { create: 'C', view: 'V', edit: 'E', delete: 'D' };
const MODULES: ModuleGroup[] = [
  {
    module: 'CRM',
    screens: [
      { id: 'leads', label: 'Leads' },
      { id: 'contacts', label: 'Contacts' },
      { id: 'companies', label: 'Companies' },
      { id: 'deals', label: 'Deals' }
    ]
  },
  {
    module: 'Analytics',
    screens: [
      { id: 'reports', label: 'Reports' },
      { id: 'dashboard', label: 'Dashboard' }
    ]
  },
  {
    module: 'Administration',
    screens: [
      { id: 'users', label: 'Users' },
      { id: 'roles', label: 'Roles' },
      { id: 'plans', label: 'Plans' }
    ]
  }
];
const ALL_SCREENS = MODULES.flatMap((moduleGroup) => moduleGroup.screens);

function perm(create = false, view = false, edit = false, remove = false): Perm {
  return { create, view, edit, delete: remove };
}

function allPerms(create: boolean, view: boolean, edit: boolean, remove: boolean): Record<string, Perm> {
  return ALL_SCREENS.reduce<Record<string, Perm>>((permissions, screen) => {
    permissions[screen.id] = perm(create, view, edit, remove);
    return permissions;
  }, {});
}

function emptyPerms(): Record<string, Perm> {
  return allPerms(false, false, false, false);
}

function viewOnly(): Record<string, Perm> {
  return allPerms(false, true, false, false);
}

@Component({
  selector: 'app-role-management',
  standalone: false,
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css'],
  animations: [
    trigger('toast', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px) scale(0.9)' }),
        animate('250ms cubic-bezier(0.2,0.8,0.2,1)', style({ opacity: 1, transform: 'none' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ]),
    trigger('moduleStagger', [
      transition('* => *', [
        query(
          '.module-group',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, animate('400ms ease-out', style({ opacity: 1, transform: 'none' })))
          ],
          { optional: true }
        )
      ])
    ])
  ]
})
export class RoleManagementComponent {
  readonly modules = MODULES;
  readonly actions = ACTIONS;
  readonly abbr = ACTION_ABBR;
  readonly iconKeys: RoleIcon[] = ['shield', 'crown', 'briefcase', 'usercog', 'sparkles'];

  readonly ShieldCheck = ShieldCheck;
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Check = Check;
  readonly Layers = Layers;
  readonly Key = Key;
  readonly Info = Info;
  readonly Save = Save;

  private readonly roleIcons: Record<RoleIcon, LucideIconData> = {
    crown: Crown,
    briefcase: Briefcase,
    usercog: UserCog,
    shield: Shield,
    sparkles: Sparkles
  };

  roles: Role[] = [
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full, unrestricted access to all modules.',
      status: 'Active',
      users: 3,
      icon: 'crown',
      permissions: allPerms(true, true, true, true)
    },
    {
      id: '2',
      name: 'Sales Manager',
      description: "Manages team, pipeline & reporting. Can't edit roles.",
      status: 'Active',
      users: 12,
      icon: 'briefcase',
      permissions: {
        ...viewOnly(),
        leads: perm(true, true, true, true),
        contacts: perm(true, true, true, false),
        companies: perm(true, true, true, false),
        deals: perm(true, true, true, true),
        reports: perm(false, true, true, false),
        dashboard: perm(false, true, false, false),
        users: perm(false, true, false, false),
        roles: perm(false, false, false, false),
        plans: perm(false, false, false, false)
      }
    },
    {
      id: '3',
      name: 'Sales Rep',
      description: 'Own leads, contacts & deals. View-only reports.',
      status: 'Active',
      users: 38,
      icon: 'usercog',
      permissions: {
        ...emptyPerms(),
        leads: perm(true, true, true, false),
        contacts: perm(true, true, true, false),
        companies: perm(false, true, false, false),
        deals: perm(true, true, true, false),
        reports: perm(false, true, false, false),
        dashboard: perm(false, true, false, false)
      }
    }
  ];

  selectedRoleId = '3';
  formOpen = false;
  isEditing = false;
  form: RoleForm = this.blankForm();
  toast: string | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  get selectedRole(): Role {
    return this.roles.find((role) => role.id === this.selectedRoleId) ?? this.roles[0];
  }

  get stats(): { active: number; assigned: number; total: number } {
    return {
      total: this.roles.length,
      active: this.roles.filter((role) => role.status === 'Active').length,
      assigned: this.roles.reduce((sum, role) => sum + role.users, 0)
    };
  }

  get totalCells(): number {
    return ALL_SCREENS.length * this.actions.length;
  }

  iconFor(name: RoleIcon): LucideIconData {
    return this.roleIcons[name] ?? Shield;
  }

  permFor(role: Role, screenId: string): Perm {
    return role.permissions[screenId] ?? perm();
  }

  grantedCount(role: Role): number {
    return Object.values(role.permissions).reduce(
      (sum, permission) => sum + this.actions.filter((action) => permission[action]).length,
      0
    );
  }

  pct(role: Role): number {
    return Math.round((this.grantedCount(role) / this.totalCells) * 100);
  }

  activeCount(role: Role, screenId: string): number {
    const permission = this.permFor(role, screenId);
    return this.actions.filter((action) => permission[action]).length;
  }

  isAllOn(role: Role, screenId: string): boolean {
    const permission = this.permFor(role, screenId);
    return this.actions.every((action) => permission[action]);
  }

  selectRole(id: string): void {
    this.selectedRoleId = id;
  }

  toggleCell(roleId: string, screenId: string, action: Action): void {
    const role = this.roles.find((item) => item.id === roleId);
    if (!role) {
      return;
    }
    const current = this.permFor(role, screenId);
    role.permissions = {
      ...role.permissions,
      [screenId]: { ...current, [action]: !current[action] }
    };
  }

  toggleScreenAll(roleId: string, screenId: string, value: boolean): void {
    const role = this.roles.find((item) => item.id === roleId);
    if (!role) {
      return;
    }
    role.permissions = {
      ...role.permissions,
      [screenId]: perm(value, value, value, value)
    };
  }

  openAddForm(): void {
    this.form = this.blankForm();
    this.isEditing = false;
    this.formOpen = true;
  }

  openEditForm(role: Role): void {
    this.form = {
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
      icon: role.icon
    };
    this.isEditing = true;
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
  }

  saveForm(): void {
    const name = this.form.name.trim();
    if (!name) {
      this.showMsg('Role name is required.');
      return;
    }
    if (this.isEditing && this.form.id) {
      const role = this.roles.find((item) => item.id === this.form.id);
      if (role) {
        role.name = name;
        role.description = this.form.description.trim();
        role.status = this.form.status;
        role.icon = this.form.icon;
      }
      this.showMsg(`${name} updated.`);
    } else {
      const newRole: Role = {
        id: String(Date.now()),
        name,
        description: this.form.description.trim(),
        status: this.form.status,
        icon: this.form.icon,
        users: 0,
        permissions: emptyPerms()
      };
      this.roles = [...this.roles, newRole];
      this.selectedRoleId = newRole.id;
      this.showMsg(`${name} created.`);
    }
    this.formOpen = false;
  }

  trackById(_: number, role: Role): string {
    return role.id;
  }

  trackByScreen(_: number, screen: Screen): string {
    return screen.id;
  }

  trackByAction(_: number, action: Action): Action {
    return action;
  }

  private blankForm(): RoleForm {
    return { id: '', name: '', description: '', status: 'Draft', icon: 'shield' };
  }

  private showMsg(message: string): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toast = message;
    this.toastTimer = setTimeout(() => {
      this.toast = null;
    }, 3000);
  }
}
