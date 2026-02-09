import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './interview.component.html',
})
export class InterviewComponent {}
