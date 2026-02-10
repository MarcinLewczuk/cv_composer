import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TestService, Test, TestWithQuestions, TestResult, UserResults } from '../../services/TestService';
import { AuthService } from '../../services/AuthService';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tests.component.html',
})
export class TestsComponent implements OnInit, OnDestroy {
  view: 'list' | 'test' | 'result' | 'generate' = 'list';
  tests: Test[] = [];
  currentTest: TestWithQuestions | null = null;
  testResult: TestResult | null = null;
  userStats: UserResults | null = null;
  
  // Test taking state
  userAnswers: { [key: number]: string } = {};
  currentQuestionIndex = 0;
  timeRemaining = 0;
  timerSubscription: Subscription | null = null;
  testStartTime = 0;
  
  // Generate test form
  generateForm = {
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionCount: 15
  };
  
  isLoading = false;
  errorMessage = '';
  
  constructor(
    public testService: TestService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Please log in to access mock tests.';
      this.isLoading = false;
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
    
    this.loadTests();
    this.loadUserStats();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  /**
   * Set difficulty level
   */
  setDifficulty(difficulty: string) {
    this.generateForm.difficulty = difficulty as 'easy' | 'medium' | 'hard';
  }

  /**
   * Load available tests
   */
  loadTests() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.testService.getTests().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.tests = response.data;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading tests:', error);
        this.errorMessage = 'Failed to load tests: ' + (error.error?.message || error.message);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Load user statistics
   */
  loadUserStats() {
    this.testService.getTestResults().subscribe({
      next: (response) => {
        if (response.success) {
          this.userStats = response.data;
          console.log('User stats loaded:', this.userStats);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  /**
   * Show generate test form
   */
  showGenerateForm() {
    this.view = 'generate';
    this.errorMessage = '';
  }

  /**
   * Generate a new test
   */
  generateTest() {
    if (!this.generateForm.topic.trim()) {
      this.errorMessage = 'Please enter a topic';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.testService.generateTest(
      this.generateForm.topic,
      this.generateForm.difficulty,
      this.generateForm.questionCount
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.view = 'list';
          // Load tests in next cycle to avoid change detection error
          setTimeout(() => this.loadTests(), 0);
          this.generateForm.topic = '';
        }
      },
      error: (error) => {
        console.error('Error generating test:', error);
        this.errorMessage = 'Failed to generate test. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Start taking a test
   */
  startTest(testId: number) {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.testService.getTestById(testId).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentTest = response.data;
          this.userAnswers = {};
          this.currentQuestionIndex = 0;
          this.timeRemaining = response.data.duration * 60; // Convert to seconds
          this.testStartTime = Date.now();
          this.isLoading = false;
          this.view = 'test';
          this.cdr.detectChanges();
          this.startTimer();
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading test:', error);
        this.errorMessage = 'Failed to load test';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Start countdown timer
   */
  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.submitTest();
      }
    });
  }

  /**
   * Stop timer
   */
  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  /**
   * Select an answer for current question
   */
  selectAnswer(questionId: number, answer: string) {
    this.userAnswers[questionId] = answer;
  }

  /**
   * Navigate between questions
   */
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion() {
    if (this.currentTest && this.currentQuestionIndex < this.currentTest.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
  }

  /**
   * Submit test
   */
  submitTest() {
    if (!this.currentTest) return;

    this.stopTimer();
    const timeTaken = Math.floor((Date.now() - this.testStartTime) / 1000);
    
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.testService.submitTest(this.currentTest.id, this.userAnswers, timeTaken).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.testResult = response.data;
          this.view = 'result';
          this.cdr.detectChanges();
          // Refresh stats after a short delay to ensure DB write completes
          setTimeout(() => this.loadUserStats(), 100);
        } else {
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error submitting test:', error);
        this.errorMessage = 'Failed to submit test';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Return to test list
   */
  backToList() {
    this.view = 'list';
    this.currentTest = null;
    this.testResult = null;
    this.errorMessage = '';
    this.stopTimer();
  }

  /**
   * Check if all questions are answered
   */
  isAllAnswered(): boolean {
    if (!this.currentTest) return false;
    return this.currentTest.questions.every(q => this.userAnswers[q.id!] !== undefined);
  }

  /**
   * Get current question
   */
  getCurrentQuestion() {
    if (!this.currentTest) return null;
    return this.currentTest.questions[this.currentQuestionIndex];
  }

  /**
   * Get answer status for a question (for navigation grid)
   */
  getAnswerStatus(index: number): string {
    if (!this.currentTest) return '';
    const question = this.currentTest.questions[index];
    if (!question.id) return '';
    
    if (this.userAnswers[question.id]) {
      return 'answered';
    }
    return '';
  }
}

