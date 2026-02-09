import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './builder.component.html',
})
export class BuilderComponent {}
