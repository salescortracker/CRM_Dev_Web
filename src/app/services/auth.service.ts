import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private baseUrl = 'https://api.crm.example.com/api/v1/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize user from storage only on browser
    if (isPlatformBrowser(this.platformId)) {
      const user = this.getUserFromStorage();
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.data.token && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
          }
        }),
        catchError((error) => {
          console.error('Login failed', error);
          return of(null);
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, userData);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user && user.permissions && user.permissions.includes(permission);
  }

  hasFieldPermission(field: string): boolean {
    const user = this.getCurrentUser();
    return user && user.fieldPermissions && user.fieldPermissions.includes(field);
  }

  hasRecordAccess(ownerId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    if (this.isSuperAdmin() || this.hasPermission('view_all_records')) {
      return true;
    }
    return user.id === ownerId || user.dataVisibility === 'global';
  }

  isSuperAdmin(): boolean {
    return this.hasRole('super-admin');
  }

  isAdmin(): boolean {
    return this.hasRole('admin') || this.isSuperAdmin();
  }
}

