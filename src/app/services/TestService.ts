import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TestQuestion {
  id?: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  order?: number;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  topic: string;
  questionCount: number;
  attemptCount?: number;
  createdAt: string;
}

export interface TestWithQuestions extends Test {
  questions: TestQuestion[];
}

export interface TestResult {
  resultId: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  results: {
    questionId: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface TestStats {
  totalTests: number;
  averageScore: number;
  bestScore: number;
}

export interface UserResults {
  stats: TestStats;
  results: {
    id: number;
    score: number;
    totalQuestions: number;
    timeTaken: number;
    completedAt: string;
    testTitle: string;
    difficulty: string;
    topic: string;
    percentage: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private baseUrl = 'http://localhost:3000/api/tests';

  constructor(private http: HttpClient) {}

  /**
   * Generate a new mock test
   */
  generateTest(topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate`, {
      topic,
      difficulty,
      questionCount
    });
  }

  /**
   * Get all available tests
   */
  getTests(): Observable<{ success: boolean; data: Test[] }> {
    return this.http.get<{ success: boolean; data: Test[] }>(this.baseUrl);
  }

  /**
   * Get a specific test with questions
   */
  getTestById(testId: number): Observable<{ success: boolean; data: TestWithQuestions }> {
    return this.http.get<{ success: boolean; data: TestWithQuestions }>(`${this.baseUrl}/${testId}`);
  }

  /**
   * Submit test answers
   */
  submitTest(testId: number, answers: { [key: number]: string }, timeTaken: number): Observable<{ success: boolean; data: TestResult }> {
    return this.http.post<{ success: boolean; data: TestResult }>(
      `${this.baseUrl}/${testId}/submit`,
      { answers, timeTaken }
    );
  }

  /**
   * Get user's test results and statistics
   */
  getTestResults(): Observable<{ success: boolean; data: UserResults }> {
    return this.http.get<{ success: boolean; data: UserResults }>(`${this.baseUrl}/results`);
  }

  /**
   * Get detailed result for a specific test submission
   */
  getResultById(resultId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/results/${resultId}`);
  }

  /**
   * Calculate time remaining
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get difficulty badge color
   */
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-600';
      case 'medium':
        return 'bg-orange-100 text-orange-600';
      case 'hard':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  /**
   * Get score badge color
   */
  getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  }
}
