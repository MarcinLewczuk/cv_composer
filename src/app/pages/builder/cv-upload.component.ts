import { Component, OnInit, OnDestroy, NgZone, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FileUploadService } from '../../services/FileUploadService';
import { AuthService } from '../../services/AuthService';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface FileRecord {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt: string;
}

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cv-upload.component.html',
  styleUrls: ['./cv-upload.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CVUploadComponent implements OnInit, OnDestroy {
  selectedFile: File | null = null;
  isUploading = false;
  uploadMessage = '';
  uploadError = '';
  uploadedFiles: FileRecord[] = [];
  userId: number | null = null;
  private destroy$ = new Subject<void>();
  private messageTimeoutId: any;

  constructor(
    private fileUploadService: FileUploadService,
    public authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get current user ID from auth service signal
    const user = this.authService.currentUser;
    console.log('Component init - Current user:', user);
    
    if (user && user.id) {
      this.userId = user.id;
      this.loadUploadedFiles();
    } else {
      console.warn('No user found on component init');
    }
  }

  ngOnDestroy() {
    if (this.messageTimeoutId) {
      clearTimeout(this.messageTimeoutId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle file selection from input
   */
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = 'Only PDF, DOC, DOCX, and TXT files are allowed';
        this.selectedFile = null;
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.uploadError = 'File size must be less than 10MB';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.uploadError = '';
      this.uploadMessage = `Selected: ${file.name}`;
    }
  }

  /**
   * Upload the selected file
   */
  uploadFile() {
    if (!this.selectedFile || !this.userId) {
      this.uploadError = 'Please select a file and ensure you are logged in';
      return;
    }

    console.log('Starting file upload...');
    this.isUploading = true;
    this.uploadError = '';
    this.uploadMessage = 'Uploading...';

    this.fileUploadService.uploadFile(this.selectedFile, this.userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        
        // Run in Angular zone to ensure change detection
        this.ngZone.run(() => {
          this.isUploading = false;
          this.uploadMessage = `✓ ${response.fileName} uploaded successfully!`;
          this.selectedFile = null;
          
          // Force change detection
          this.cdr.detectChanges();
          
          // Reload the files list
          this.loadUploadedFiles();
          
          // Clear message after 4 seconds
          if (this.messageTimeoutId) {
            clearTimeout(this.messageTimeoutId);
          }
          this.messageTimeoutId = setTimeout(() => {
            this.uploadMessage = '';
            this.cdr.detectChanges();
          }, 4000);
        });
      },
      error: (error) => {
        console.error('Upload error full:', error);
        
        this.ngZone.run(() => {
          this.isUploading = false;
          this.uploadError = error.error?.error || error.message || 'Upload failed. Please try again.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  /**
   * Load all uploaded files for the user
   */
  loadUploadedFiles() {
    if (!this.userId) {
      console.warn('No user ID available to load files');
      return;
    }

    console.log('Loading uploaded files for user:', this.userId);

    this.fileUploadService.getUserFiles(this.userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (files) => {
        console.log('Files loaded successfully:', files);
        
        this.ngZone.run(() => {
          this.uploadedFiles = files;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading files:', error);
        // Don't show error to user for initial load, just log it
      }
    });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Download a file
   */
  downloadFile(filePath: string, fileName: string) {
    console.log('Downloading file:', fileName, 'from path:', filePath);
    const link = document.createElement('a');
    link.href = `http://localhost:3000${filePath}`;
    link.download = fileName;
    link.click();
  }
}
