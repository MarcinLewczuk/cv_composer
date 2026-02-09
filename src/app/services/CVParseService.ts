import { Injectable } from '@angular/core';
import JSZip from 'jszip';

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface CVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  skills: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CVParseService {
  constructor() {}

  /**
   * Extract CV data from text
   */
  extractCVFromText(text: string): CVData {
    return this.parseText(text);
  }

  /**
   * Create empty CV template
   */
  createEmptyCV(): CVData {
    return {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      experiences: [],
      educations: [],
      certifications: [],
      skills: []
    };
  }

  /**
   * Parse text into CV data
   */
  private parseText(text: string): CVData {
    const cvData = this.createEmptyCV();

    if (!text || text.trim().length === 0) {
      return cvData;
    }

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Extract email
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) {
      cvData.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = text.match(/(\+?1?\s?)?(\(\d{3}\)|\d{3})[.\s-]?\d{3}[.\s-]?\d{4}/);
    if (phoneMatch) {
      cvData.phone = phoneMatch[0];
    }

    // First line as name
    if (lines.length > 0 && !lines[0].includes('@')) {
      cvData.fullName = lines[0];
    }

    // Look for summary/profile section
    for (let i = 0; i < lines.length; i++) {
      if (['summary', 'objective', 'professional', 'profile'].some(kw => lines[i].toLowerCase().includes(kw))) {
        if (i + 1 < lines.length) cvData.summary = lines[i + 1];
        break;
      }
    }

    // Extract skills
    for (let i = 0; i < lines.length; i++) {
      if (['skills', 'technical'].some(kw => lines[i].toLowerCase().includes(kw))) {
        i++;
        while (i < lines.length) {
          const skills = lines[i].split(/[,•\-]/).map(s => s.trim()).filter(s => s.length > 0);
          cvData.skills.push(...skills);
          i++;
          if (i < lines.length && lines[i].match(/^[A-Z][a-z]+ /)) break;
        }
        break;
      }
    }

    return cvData;
  }

  /**
   * Download CV data as JSON file
   */
  downloadAsJSON(cvData: CVData, filename: string = 'cv.json'): void {
    const json = JSON.stringify(cvData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

