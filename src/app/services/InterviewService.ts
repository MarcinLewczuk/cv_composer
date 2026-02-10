import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InterviewSession {
  id: number;
  jobRole: string;
  experienceLevel: string;
  questionCount: number;
  createdAt: string;
  answeredCount?: number;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  questionType: 'technical' | 'behavioral' | 'situational' | 'role-specific';
  order: number;
}

export interface InterviewSessionWithQuestions extends InterviewSession {
  questions: InterviewQuestion[];
}

export interface QuestionDetails extends InterviewQuestion {
  sampleAnswer: string;
  tips: string;
}

export interface InterviewResponse {
  questionId: number;
  question: string;
  questionType: string;
  sampleAnswer: string;
  tips: string;
  userAnswer: string | null;
  completedAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private baseUrl = 'http://localhost:3000/api/interviews';

  constructor(private http: HttpClient) {}

  /**
   * Generate a new interview practice session
   */
  generateSession(jobRole: string, experienceLevel: string, questionCount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate`, {
      jobRole,
      experienceLevel,
      questionCount
    });
  }

  /**
   * Get all interview sessions
   */
  getSessions(): Observable<{ success: boolean; data: InterviewSession[] }> {
    return this.http.get<{ success: boolean; data: InterviewSession[] }>(this.baseUrl);
  }

  /**
   * Get a specific interview session with questions
   */
  getSessionById(sessionId: number): Observable<{ success: boolean; data: InterviewSessionWithQuestions }> {
    return this.http.get<{ success: boolean; data: InterviewSessionWithQuestions }>(`${this.baseUrl}/${sessionId}`);
  }

  /**
   * Get question details (sample answer and tips)
   */
  getQuestionDetails(questionId: number): Observable<{ success: boolean; data: QuestionDetails }> {
    return this.http.get<{ success: boolean; data: QuestionDetails }>(`${this.baseUrl}/questions/${questionId}`);
  }

  /**
   * Submit an answer for a question
   */
  submitAnswer(sessionId: number, questionId: number, answer: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/submit-answer`, {
      sessionId,
      questionId,
      answer
    });
  }

  /**
   * Get all responses for a session
   */
  getSessionResponses(sessionId: number): Observable<{ success: boolean; data: InterviewResponse[] }> {
    return this.http.get<{ success: boolean; data: InterviewResponse[] }>(`${this.baseUrl}/${sessionId}/responses`);
  }

  /**
   * Get question type badge color
   */
  getQuestionTypeColor(type: string): string {
    switch (type) {
      case 'technical':
        return 'bg-blue-100 text-blue-700';
      case 'behavioral':
        return 'bg-green-100 text-green-700';
      case 'situational':
        return 'bg-purple-100 text-purple-700';
      case 'role-specific':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
