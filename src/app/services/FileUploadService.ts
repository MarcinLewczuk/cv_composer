import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface UploadResponse {
  success: boolean;
  fileId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  message: string;
}

interface FileRecord {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = 'http://localhost:3000';
  private uploadProgress$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * Upload a CV file
   */
  uploadFile(file: File, userId: number): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());

    console.log('Uploading file:', file.name, 'for user:', userId);

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get all uploaded files for a user
   */
  getUserFiles(userId: number): Observable<FileRecord[]> {
    console.log('Fetching files for user:', userId);
    
    return this.http.get<FileRecord[]>(`${this.apiUrl}/uploads/${userId}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get upload progress observable
   */
  getUploadProgress(): Observable<number> {
    return this.uploadProgress$.asObservable();
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    console.error('HTTP Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status) {
        errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
      }
    }

    console.error('Processed error message:', errorMessage);
    
    return throwError(() => ({
      error: {
        error: errorMessage
      },
      message: errorMessage
    }));
  }
}
