import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FileUploadService } from '../../services/FileUploadService';
import { AuthService } from '../../services/AuthService';
import { CVParseService } from '../../services/CVParseService';
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

export interface ExtractedCVData {
  fileName: string;
  filePath: string;
  cvText: string;
}

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cv-upload.component.html',
  styleUrls: ['./cv-upload.component.css'],
})
export class CVUploadComponent implements OnInit, OnDestroy {
  selectedFile: File | null = null;
  isUploading = false;
  uploadMessage = '';
  uploadError = '';
  uploadedFiles: FileRecord[] = [];
  userId: number | null = null;
  isDragOver = false;
  isExtracting = false;

  @Output() cvSelected = new EventEmitter<ExtractedCVData>();

  private destroy$ = new Subject<void>();
  private messageTimeoutId: any;
  private fileUploadService = inject(FileUploadService);
  public authService = inject(AuthService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private cvParseService = inject(CVParseService);

  ngOnInit() {
    // Get current user ID from auth service signal
    const user = this.authService.currentUser;
    console.log('CVUploadComponent init - Current user:', user);
    console.log('Auth service isAuthenticated:', this.authService.isAuthenticated());

    if (user && user.id) {
      this.userId = user.id;
      console.log('User ID set to:', this.userId);
      this.loadUploadedFiles();
    } else {
      console.warn('No user found on component init - cannot upload');
      this.uploadError = 'Please log in to upload files';
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
    console.log(
      'File selection event - file:',
      file?.name,
      'type:',
      file?.type,
      'size:',
      file?.size,
    );

    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = 'Only PDF, DOC, DOCX, and TXT files are allowed';
        this.selectedFile = null;
        console.warn('File type not allowed:', file.type);
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.uploadError = 'File size must be less than 10MB';
        this.selectedFile = null;
        console.warn('File size too large:', file.size);
        return;
      }

      this.selectedFile = file;
      this.uploadError = '';
      this.uploadMessage = `Selected: ${file.name}`;
      console.log('File selected successfully - ready to upload');
    }
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  /**
   * Handle file drop
   */
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('File dropped:', file.name, 'type:', file.type, 'size:', file.size);

      // Trigger the file selection logic
      const fakeEvent = { target: { files: files } };
      this.onFileSelected(fakeEvent);
    }
  }

  /**
   * Upload the selected file
   */
  uploadFile() {
    console.log(
      'uploadFile called - selectedFile:',
      this.selectedFile?.name,
      'userId:',
      this.userId,
    );

    if (!this.selectedFile) {
      this.uploadError = 'Please select a file first';
      console.warn('Upload attempted without file selection');
      return;
    }

    if (!this.userId) {
      this.uploadError = 'User not authenticated. Please log in first.';
      console.warn('Upload attempted without user ID');
      console.log('Current user from auth service:', this.authService.currentUser);
      return;
    }

    console.log(
      'Starting file upload... File:',
      this.selectedFile.name,
      'Size:',
      this.selectedFile.size,
      'User:',
      this.userId,
    );
    this.isUploading = true;
    this.uploadError = '';
    this.uploadMessage = 'Uploading...';

    this.fileUploadService
      .uploadFile(this.selectedFile, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
          console.error('Upload error full object:', error);
          console.error('Upload error message:', error?.message);
          console.error('Upload error response:', error?.error);

          this.ngZone.run(() => {
            this.isUploading = false;
            this.uploadError =
              error?.error?.error || error?.message || 'Upload failed. Please try again.';
            console.error('Processed error message shown to user:', this.uploadError);
            this.cdr.detectChanges();
          });
        },
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

    this.fileUploadService
      .getUserFiles(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (files) => {
          console.log('Files loaded successfully:', files?.length || 0, 'files');

          this.ngZone.run(() => {
            this.uploadedFiles = files;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Error loading files:', error);
          // Don't show error to user for initial load, just log it
        },
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

  /**
   * Extract CV text from uploaded file and prepare for AI processing
   */
  async selectCVForProcessing(file: FileRecord) {
    console.log('Selecting CV for processing:', file.originalFileName);
    this.isExtracting = true;
    this.uploadError = '';

    try {
      // Call backend to extract text from file
      const response = await fetch('http://localhost:3000/parse-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: file.filePath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse CV file');
      }

      const parseResult = await response.json();
      const extractedText = parseResult.extractedText;

      console.log('CV text extracted successfully - Length:', extractedText.length);

      // Emit the extracted CV data to parent component
      this.cvSelected.emit({
        fileName: file.originalFileName,
        filePath: file.filePath,
        cvText: extractedText,
      });

      this.uploadMessage = `✓ CV "${file.originalFileName}" ready for AI processing`;
    } catch (error) {
      console.error('Error extracting CV:', error);
      this.uploadError = `Failed to extract CV: ${(error as Error).message}`;
    } finally {
      this.isExtracting = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Download uploaded file as JSON
   */
  async downloadAsJSON(file: FileRecord) {
    try {
      // Call backend to extract text from file
      const response = await fetch('http://localhost:3000/parse-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: file.filePath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse file');
      }

      const parseResult = await response.json();
      const extractedText = parseResult.extractedText;

      console.log('Extracted text length:', extractedText.length);

      // Create simple JSON with extracted text
      const jsonData = { cv: extractedText };
      const jsonString = JSON.stringify(jsonData, null, 2);
      const jsonFileName = file.originalFileName.replace(/\.[^/.]+$/, '') + '.json';

      // Create blob and trigger download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = jsonFileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading as JSON:', error);
      this.uploadError = `Failed to convert file to JSON: ${(error as Error).message}`;
    }
  }
}
