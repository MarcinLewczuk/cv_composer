import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  InterviewService,
  InterviewSession,
  InterviewSessionWithQuestions,
  QuestionDetails,
  InterviewResponse
} from '../../services/InterviewService';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview.component.html',
})
export class InterviewComponent implements OnInit {
  view: 'list' | 'generate' | 'practice' | 'review' = 'list';
  sessions: InterviewSession[] = [];
  currentSession: InterviewSessionWithQuestions | null = null;
  currentQuestionIndex = 0;
  currentQuestionDetails: QuestionDetails | null = null;
  showSampleAnswer = false;
  showTips = false;
  
  // User's answer for current question
  userAnswer = '';
  currentAnswer = ''; // Alias for template compatibility
  
  // User's answers map
  userAnswers: { [questionId: number]: string } = {};
  
  // Generate session form
  generateForm = {
    jobRole: '',
    experienceLevel: 'mid-level' as 'entry' | 'mid-level' | 'senior' | 'lead',
    questionCount: 10
  };

  // Review data
  reviewData: InterviewResponse[] = [];
  sessionResponses: InterviewResponse[] = []; // Alias for template compatibility
  
  isLoading = false;
  errorMessage = '';
  
  constructor(
    public interviewService: InterviewService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Please log in to access interview practice.';
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
    
    this.loadSessions();
  }

  /**
   * Load all interview sessions
   */
  loadSessions() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.interviewService.getSessions().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.sessions = response.data;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading sessions:', error);
        this.errorMessage = 'Failed to load sessions';
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Show generate form
   */
  showGenerateForm() {
    this.view = 'generate';
    this.errorMessage = '';
  }

  /**
   * Generate a new interview session
   */
  generateSession() {
    if (!this.generateForm.jobRole.trim()) {
      this.errorMessage = 'Please enter a job role';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.interviewService.generateSession(
      this.generateForm.jobRole,
      this.generateForm.experienceLevel,
      this.generateForm.questionCount
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        if (response.success) {
          this.view = 'list';
          setTimeout(() => this.loadSessions(), 0);
          this.generateForm.jobRole = '';
        }
      },
      error: (error) => {
        console.error('Error generating session:', error);
        this.errorMessage = 'Failed to generate interview session. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Start practicing an interview session
   */
  startPractice(sessionId: number) {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.interviewService.getSessionById(sessionId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.currentSession = response.data;
          this.currentQuestionIndex = 0;
          this.userAnswer = '';
          this.showSampleAnswer = false;
          this.view = 'practice';
          this.loadCurrentQuestionDetails();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading session:', error);
        this.errorMessage = 'Failed to load session';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Load details for current question
   */
  loadCurrentQuestionDetails() {
    if (!this.currentSession) return;
    
    const currentQuestion = this.currentSession.questions[this.currentQuestionIndex];
    if (!currentQuestion) return;

    this.interviewService.getQuestionDetails(currentQuestion.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentQuestionDetails = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading question details:', error);
      }
    });
  }

  /**
   * Submit answer for current question
   */
  submitAnswer() {
    // Sync currentAnswer to userAnswer
    this.userAnswer = this.currentAnswer;
    
    if (!this.currentSession || !this.userAnswer.trim()) {
      this.errorMessage = 'Please provide an answer';
      return;
    }

    const currentQuestion = this.currentSession.questions[this.currentQuestionIndex];
    
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.interviewService.submitAnswer(
      this.currentSession.id,
      currentQuestion.id,
      this.userAnswer
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Save to map
          this.userAnswers[currentQuestion.id] = this.userAnswer;
          // Move to next question or finish
          if (this.currentQuestionIndex < this.currentSession!.questions.length - 1) {
            this.currentQuestionIndex++;
            this.userAnswer = '';
            this.currentAnswer = '';
            this.showSampleAnswer = false;
            this.showTips = false;
            this.loadCurrentQuestionDetails();
          } else {
            // All questions answered
            this.viewReview(this.currentSession!.id);
          }
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error submitting answer:', error);
        this.errorMessage = 'Failed to submit answer';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Toggle sample answer visibility
   */
  toggleSampleAnswer() {
    this.showSampleAnswer = !this.showSampleAnswer;
  }

  /**
   * Navigate between questions
   */
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.userAnswer = '';
      this.currentAnswer = '';
      this.showSampleAnswer = false;
      this.showTips = false;
      this.loadCurrentQuestionDetails();
    }
  }

  nextQuestion() {
    if (this.currentSession &&this.currentQuestionIndex < this.currentSession.questions.length - 1) {
      this.currentQuestionIndex++;
      this.userAnswer = '';
      this.currentAnswer = '';
      this.showSampleAnswer = false;
      this.showTips = false;
      this.loadCurrentQuestionDetails();
    }
  }

  /**
   * View review of completed session
   */
  viewReview(sessionId: number) {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.interviewService.getSessionResponses(sessionId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.reviewData = response.data;
          this.sessionResponses = response.data; // Sync for template compatibility
          this.view = 'review';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading review data:', error);
        this.errorMessage = 'Failed to load review';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Return to session list
   */
  backToList() {
    this.view = 'list';
    this.currentSession = null;
    this.currentQuestionDetails = null;
    this.userAnswer = '';
    this.errorMessage = '';
    this.loadSessions();
  }

  /**
   * Get current question
   */
  getCurrentQuestion() {
    if (!this.currentSession) return null;
    return this.currentSession.questions[this.currentQuestionIndex];
  }

  /**
   * Get progress percentage
   */
  getProgress(): number {
    if (!this.currentSession) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.currentSession.questions.length) * 100);
  }

  /**
   * Get progress percentage (alias)
   */
  getProgressPercentage(): number {
    return this.getProgress();
  }

  /**
   * Get answered count
   */
  getAnsweredCount(): number {
    return Object.keys(this.userAnswers).length;
  }

  /**
   * Toggle tips visibility
   */
  toggleTips() {
    if (!this.showTips && !this.currentQuestionDetails) {
      this.loadCurrentQuestionDetails();
    }
    this.showTips = !this.showTips;
  }

  /**
   * Start practice session (alias for template)
   */
  startSession(sessionId: number) {
    this.startPractice(sessionId);
  }

  /**
   * Review session (alias for viewReview)
   */
  reviewSession(sessionId: number) {
    this.viewReview(sessionId);
  }

  /**
   * Finish practice and go to review
   */
  finishPractice() {
    if (this.currentSession) {
      this.viewReview(this.currentSession.id);
    }
  }
}

