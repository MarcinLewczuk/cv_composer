import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Request/Response types matching backend
export interface ParseCVRequest {
  cvText: string;
}

export interface ParsedCV {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    duration?: string;
    description?: string;
    achievements?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear?: string;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export interface ParseCVResponse {
  success: boolean;
  message: string;
  data: {
    parsedCV: ParsedCV;
    cacheKey: string;
  };
}

export interface ReviewResult {
  isValid: boolean;
  structureIssues: string[];
  styleIssues: string[];
  recommendations: string[];
}

export interface ReviewCVResponse {
  success: boolean;
  message: string;
  data: ReviewResult;
}

export interface ImprovedCV extends ParsedCV {}

export interface ImproveCVResponse {
  success: boolean;
  message: string;
  data: ImprovedCV;
}

export interface TailorCVRequest {
  cvJson: ParsedCV;
  jobBrief: string;
}

export interface TailorCVResponse {
  success: boolean;
  message: string;
  data: ImprovedCV;
}

export interface GenerateQuestionsRequest {
  cvJson: ParsedCV;
  jobBrief: string;
}

export interface GenerateQuestionsResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AIService {
  private apiUrl = 'http://localhost:3000/api/cv';

  constructor(private http: HttpClient) {}

  /**
   * Parse CV text to structured JSON
   */
  parseCV(cvText: string): Observable<ParseCVResponse> {
    return this.http.post<ParseCVResponse>(`${this.apiUrl}/parse`, {
      cvText,
    });
  }

  /**
   * Review a CV and get detailed feedback
   */
  reviewCV(cvJson: ParsedCV): Observable<ReviewCVResponse> {
    return this.http.post<ReviewCVResponse>(`${this.apiUrl}/review`, {
      cvJson,
    });
  }

  /**
   * Improve CV language and formatting
   */
  improveCV(cvJson: ParsedCV): Observable<ImproveCVResponse> {
    return this.http.post<ImproveCVResponse>(`${this.apiUrl}/improve`, {
      cvJson,
    });
  }

  /**
   * Tailor CV for a specific job description
   */
  tailorCVForJob(cvJson: ParsedCV, jobBrief: string): Observable<TailorCVResponse> {
    return this.http.post<TailorCVResponse>(`${this.apiUrl}/tailor`, {
      cvJson,
      jobBrief,
    });
  }

  /**
   * Generate interview questions based on CV and job description
   */
  generateInterviewQuestions(
    cvJson: ParsedCV,
    jobBrief: string,
  ): Observable<GenerateQuestionsResponse> {
    return this.http.post<GenerateQuestionsResponse>(`${this.apiUrl}/generate-questions`, {
      cvJson,
      jobBrief,
    });
  }
}
