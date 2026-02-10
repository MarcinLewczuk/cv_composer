import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ParsedCV } from './AIService';

/**
 * Service to share parsed CV data and tailor results across components
 */
@Injectable({
  providedIn: 'root',
})
export class CVDataService {
  private tailoredCVSubject = new BehaviorSubject<ParsedCV | null>(null);
  private cvSkillsSubject = new BehaviorSubject<string[]>([]);

  tailoredCV$ = this.tailoredCVSubject.asObservable();
  cvSkills$ = this.cvSkillsSubject.asObservable();

  setTailoredCV(cv: ParsedCV): void {
    this.tailoredCVSubject.next(cv);
    // Also extract and set skills for job filtering
    if (cv.skills && cv.skills.length > 0) {
      this.cvSkillsSubject.next(cv.skills);
    }
  }

  getTailoredCV(): ParsedCV | null {
    return this.tailoredCVSubject.value;
  }

  getCVSkills(): string[] {
    return this.cvSkillsSubject.value;
  }

  clearTailoredCV(): void {
    this.tailoredCVSubject.next(null);
    this.cvSkillsSubject.next([]);
  }
}
