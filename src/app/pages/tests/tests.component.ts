import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tests.component.html',
})
export class TestsComponent {}
