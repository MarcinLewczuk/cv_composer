import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { AuthService } from './services/AuthService';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private auth = inject(AuthService);

  ngOnInit() {
    // Restore session from localStorage on app initialization
    this.auth.restore();
  }
}
