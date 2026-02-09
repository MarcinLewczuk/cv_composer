import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CVUploadComponent } from './cv-upload.component';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, RouterModule, CVUploadComponent],
  templateUrl: './builder.component.html',
})
export class BuilderComponent {}
