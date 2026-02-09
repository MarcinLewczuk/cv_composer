import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CVUploadComponent } from './cv-upload.component';
import { CVEditorComponent } from './cv-editor.component';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, RouterModule, CVUploadComponent, CVEditorComponent],
  templateUrl: './builder.component.html',
})
export class BuilderComponent {}
