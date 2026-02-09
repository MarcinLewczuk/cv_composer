import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CVGenerateRequest {
  userInput: string;
}

export interface CVGenerateResponse {
  cv: string;
}

export interface CVReviewRequest {
  cvContent: string;
}

export interface CVReviewResponse {
  review: string;
}

export interface CVTailorRequest {
  cvContent: string;
  jobDescription: string;
}

export interface CVTailorResponse {
  tailoredCV: string;
}

export interface InterviewQuestionsRequest {
  cvContent: string;
  jobDescription?: string;
}

export interface InterviewQuestionsResponse {
  questions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AIService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Generate a professional CV from user input using AI
   */
  generateCV(userInput: string): Observable<CVGenerateResponse> {
    return this.http.post<CVGenerateResponse>(`${this.apiUrl}/cv/generate`, {
      userInput,
    });
  }

  /**
   * Review a CV and get detailed feedback
   */
  reviewCV(cvContent: string): Observable<CVReviewResponse> {
    return this.http.post<CVReviewResponse>(`${this.apiUrl}/cv/review`, {
      cvContent,
    });
  }

  /**
   * Tailor a CV for a specific job description
   */
  tailorCVForJob(cvContent: string, jobDescription: string): Observable<CVTailorResponse> {
    return this.http.post<CVTailorResponse>(`${this.apiUrl}/cv/tailor`, {
      cvContent,
      jobDescription,
    });
  }

  /**
   * Generate interview questions based on CV and optionally job description
   */
  generateInterviewQuestions(
    cvContent: string,
    jobDescription?: string,
  ): Observable<InterviewQuestionsResponse> {
    return this.http.post<InterviewQuestionsResponse>(
      `${this.apiUrl}/interview/generate-questions`,
      {
        cvContent,
        jobDescription,
      },
    );
  }
}
