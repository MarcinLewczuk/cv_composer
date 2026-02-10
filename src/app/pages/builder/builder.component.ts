import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVUploadComponent } from './cv-upload.component';
import { CVEditorComponent } from './cv-editor.component';
import { AIService, ParsedCV, ReviewResult } from '../../services/AIService';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, CVUploadComponent, CVEditorComponent],
  templateUrl: './builder.component.html',
})
export class BuilderComponent {
  // CV Upload state
  selectedUploadedCV: any = null;
  uploadedCVParsed: ParsedCV | null = null;

  // AI state
  aiLoading = false;
  aiMessage = '';
  aiError = '';

  // Job input
  jobDescriptionInput = '';

  // Result properties
  reviewResult: ReviewResult | null = null;
  improvedCV: ParsedCV | null = null;
  tailoredCV: ParsedCV | null = null;
  interviewQuestions: string[] = [];

  private aiService = inject(AIService);
  private cdr = inject(ChangeDetectorRef);

  /**
   * Handle when a CV is selected from upload component
   */
  onUploadedCVSelected(event: any) {
    this.selectedUploadedCV = event;
    this.clearMessages();
    
    // If we have cvText, parse it using AI service
    if (event?.cvText) {
      this.aiLoading = true;
      this.aiMessage = 'Parsing CV...';
      
      this.aiService.parseCV(event.cvText).subscribe({
        next: (response) => {
          this.aiLoading = false;
          if (response.success) {
            this.uploadedCVParsed = response.data.parsedCV;
            this.aiMessage = 'CV parsed successfully! You can now use AI features below.';
            this.cdr.detectChanges();
          } else {
            this.aiError = response.message || 'Failed to parse CV';
          }
        },
        error: (error) => {
          this.aiLoading = false;
          this.aiError = error.error?.message || 'Failed to parse CV. Please try again.';
        }
      });
    }
  }

  /**
   * Review the uploaded CV
   */
  reviewUploadedCV() {
    if (!this.uploadedCVParsed) return;

    this.aiLoading = true;
    this.clearMessages();
    this.aiMessage = 'Reviewing your CV...';

    this.aiService.reviewCV(this.uploadedCVParsed).subscribe({
      next: (response: any) => {
        this.aiLoading = false;
        this.aiMessage = 'CV Review complete!';
        this.reviewResult = response.data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.aiLoading = false;
        this.aiError = error.error?.message || 'Failed to review CV. Please try again.';
      },
    });
  }

  /**
   * Improve language in the uploaded CV
   */
  improveUploadedCV() {
    if (!this.uploadedCVParsed) return;

    this.aiLoading = true;
    this.clearMessages();
    this.aiMessage = 'Improving your CV...';

    this.aiService.improveCV(this.uploadedCVParsed).subscribe({
      next: (response: any) => {
        this.aiLoading = false;
        this.aiMessage = 'CV improved!';
        this.improvedCV = response.data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.aiLoading = false;
        this.aiError = error.error?.message || 'Failed to improve CV. Please try again.';
      },
    });
  }

  /**
   * Tailor CV for a specific job
   */
  tailorUploadedCV() {
    if (!this.uploadedCVParsed || !this.jobDescriptionInput.trim()) return;

    this.aiLoading = true;
    this.clearMessages();
    this.aiMessage = 'Tailoring your CV for the job...';

    this.aiService.tailorCVForJob(this.uploadedCVParsed, this.jobDescriptionInput).subscribe({
      next: (response: any) => {
        this.aiLoading = false;
        this.aiMessage = 'CV tailored successfully!';
        this.tailoredCV = response.data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.aiLoading = false;
        this.aiError = error.error?.message || 'Failed to tailor CV. Please try again.';
      },
    });
  }

  /**
   * Generate interview questions based on CV and job description
   */
  generateInterviewQuestionsForUploadedCV() {
    if (!this.uploadedCVParsed || !this.jobDescriptionInput.trim()) return;

    this.aiLoading = true;
    this.clearMessages();
    this.aiMessage = 'Generating interview questions...';

    this.aiService
      .generateInterviewQuestions(this.uploadedCVParsed, this.jobDescriptionInput)
      .subscribe({
        next: (response: any) => {
          this.aiLoading = false;
          this.aiMessage = 'Interview questions generated!';
          this.interviewQuestions = response.data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.aiLoading = false;
          this.aiError =
            error.error?.message || 'Failed to generate interview questions. Please try again.';
        },
      });
  }

  /**
   * Download improved CV as JSON
   */
  downloadImprovedCV() {
    if (!this.improvedCV) return;

    const dataStr = JSON.stringify(this.improvedCV, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `improved-cv-${new Date().getTime()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download tailored CV as JSON
   */
  downloadTailoredCV() {
    if (!this.tailoredCV) return;

    const dataStr = JSON.stringify(this.tailoredCV, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tailored-cv-${new Date().getTime()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Clear error and success messages
   */
  private clearMessages() {
    this.aiError = '';
    this.aiMessage = '';
  }
}
