import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkWithHref } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkWithHref, CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}