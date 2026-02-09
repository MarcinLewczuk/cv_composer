import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CVUploadComponent } from './cv-upload.component';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, CVUploadComponent],
  templateUrl: './builder.component.html',
})
export class BuilderComponent {}
