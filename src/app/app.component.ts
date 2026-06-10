import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mockup_crm';

  constructor(public router: Router) {}

  get isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url.startsWith('/login?');
  }
}
