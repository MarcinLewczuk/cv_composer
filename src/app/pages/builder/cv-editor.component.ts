import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  CVParseService,
  CVData,
  Experience,
  Education,
  Certification,
} from '../../services/CVParseService';
import { AIService, ParsedCV } from '../../services/AIService';

@Component({
  selector: 'app-cv-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cv-editor.component.html',
  styleUrls: ['./cv-editor.component.css'],
})
export class CVEditorComponent implements OnInit {
  cvForm!: FormGroup;
  expandedSections = {
    personal: true,
    experiences: false,
    educations: false,
    certifications: false,
    skills: false,
  };

  // AI functionality states
  aiLoading = false;
  aiMessage = '';
  aiError = '';
  jobDescriptionInput = '';

  // CV display state
  displayedCV: ParsedCV | null = null;
  showCVPreview = false;

  // Saved CVs state
  savedCVs: any[] = [];
  editingCVId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private cvParseService: CVParseService,
    private aiService: AIService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadSavedCVs();
  }

  /**
   * Initialize the CV form with all sections
   */
  initializeForm() {
    const emptyCv = this.cvParseService.createEmptyCV();

    this.cvForm = this.fb.group({
      fullName: [emptyCv.fullName, Validators.required],
      email: [emptyCv.email, [Validators.required, Validators.email]],
      phone: [emptyCv.phone],
      location: [emptyCv.location],
      summary: [emptyCv.summary],
      experiences: this.fb.array(this.createExperienceFormGroups(emptyCv.experiences)),
      educations: this.fb.array(this.createEducationFormGroups(emptyCv.educations)),
      certifications: this.fb.array(this.createCertificationFormGroups(emptyCv.certifications)),
      skills: this.fb.array(this.createSkillFormControls(emptyCv.skills)),
    });
  }

  /**
   * Create experience form groups
   */
  private createExperienceFormGroups(experiences: Experience[]) {
    return experiences.map((exp) =>
      this.fb.group({
        company: [exp.company, Validators.required],
        position: [exp.position, Validators.required],
        duration: [exp.duration],
        description: [exp.description],
      }),
    );
  }

  /**
   * Create education form groups
   */
  private createEducationFormGroups(educations: Education[]) {
    return educations.map((edu) =>
      this.fb.group({
        institution: [edu.institution, Validators.required],
        degree: [edu.degree, Validators.required],
        field: [edu.field, Validators.required],
        graduationYear: [edu.graduationYear],
      }),
    );
  }

  /**
   * Create certification form groups
   */
  private createCertificationFormGroups(certifications: Certification[]) {
    return certifications.map((cert) =>
      this.fb.group({
        name: [cert.name, Validators.required],
        issuer: [cert.issuer, Validators.required],
        date: [cert.date],
      }),
    );
  }

  /**
   * Create skill form controls
   */
  private createSkillFormControls(skills: string[]) {
    return skills.map((skill) => this.fb.control(skill, Validators.required));
  }

  /**
   * Add new experience
   */
  addExperience() {
    const experiences = this.cvForm.get('experiences') as FormArray;
    experiences.push(
      this.fb.group({
        company: ['', Validators.required],
        position: ['', Validators.required],
        duration: [''],
        description: [''],
      }),
    );
  }

  /**
   * Remove experience
   */
  removeExperience(index: number) {
    const experiences = this.cvForm.get('experiences') as FormArray;
    experiences.removeAt(index);
  }

  /**
   * Add new education
   */
  addEducation() {
    const educations = this.cvForm.get('educations') as FormArray;
    educations.push(
      this.fb.group({
        institution: ['', Validators.required],
        degree: ['', Validators.required],
        field: ['', Validators.required],
        graduationYear: [''],
      }),
    );
  }

  /**
   * Remove education
   */
  removeEducation(index: number) {
    const educations = this.cvForm.get('educations') as FormArray;
    educations.removeAt(index);
  }

  /**
   * Add new certification
   */
  addCertification() {
    const certifications = this.cvForm.get('certifications') as FormArray;
    certifications.push(
      this.fb.group({
        name: ['', Validators.required],
        issuer: ['', Validators.required],
        date: [''],
      }),
    );
  }

  /**
   * Remove certification
   */
  removeCertification(index: number) {
    const certifications = this.cvForm.get('certifications') as FormArray;
    certifications.removeAt(index);
  }

  /**
   * Add new skill
   */
  addSkill() {
    const skills = this.cvForm.get('skills') as FormArray;
    skills.push(this.fb.control('', Validators.required));
  }

  /**
   * Remove skill
   */
  removeSkill(index: number) {
    const skills = this.cvForm.get('skills') as FormArray;
    skills.removeAt(index);
  }

  /**
   * Toggle section expand/collapse
   */
  toggleSection(section: keyof typeof this.expandedSections) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  /**
   * Get experiences form array
   */
  get experiences() {
    return this.cvForm.get('experiences') as FormArray;
  }

  /**
   * Get educations form array
   */
  get educations() {
    return this.cvForm.get('educations') as FormArray;
  }

  /**
   * Get certifications form array
   */
  get certifications() {
    return this.cvForm.get('certifications') as FormArray;
  }

  /**
   * Get skills form array
   */
  get skills() {
    return this.cvForm.get('skills') as FormArray;
  }

  /**
   * Save CV to Database
   */
  saveCVToDatabase() {
    if (!this.displayedCV) {
      this.aiError = 'Please build your CV first before saving';
      return;
    }

    // Format the CV data to match backend expectations
    const cvPayload = {
      cvJson: this.displayedCV,
      originalContent: this.formatCVAsText(),
    };

    this.aiLoading = true;
    this.clearMessages();

    const endpoint = this.editingCVId
      ? `http://localhost:3000/api/cv/${this.editingCVId}`
      : 'http://localhost:3000/api/cv/save';

    const request = this.editingCVId
      ? this.http.put(endpoint, cvPayload)
      : this.http.post(endpoint, cvPayload);

    request.subscribe({
      next: (response: any) => {
        this.aiLoading = false;
        this.aiMessage = this.editingCVId
          ? 'CV updated and saved to database!'
          : 'CV saved to database successfully!';
        this.editingCVId = null;
        this.displayedCV = null;
        this.showCVPreview = false;
        this.cvForm.reset();
        this.loadSavedCVs();
      },
      error: (error: any) => {
        this.aiLoading = false;
        const errorMsg =
          error?.error?.message || error?.error?.error || error?.message || 'Unknown error';
        this.aiError = `Failed to save CV: ${errorMsg}`;
        console.error('Save CV Error:', error);
      },
    });
  }

  /**
   * Load all saved CVs from database
   */
  loadSavedCVs() {
    this.http.get('http://localhost:3000/api/cv').subscribe({
      next: (response: any) => {
        this.savedCVs = response.data || [];
      },
      error: (error) => {
        console.error('Failed to load saved CVs:', error);
      },
    });
  }

  /**
   * Edit saved CV - Load it into the form
   */
  editCV(cv: any) {
    this.editingCVId = cv.id;
    // Build a ParsedCV object from the stored data
    const parsedCV: ParsedCV = {
      personalInfo: {
        name: cv.fullName || '',
        email: cv.email || '',
        phone: cv.phone,
        location: cv.location,
      },
      summary: cv.summary,
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };
    this.displayedCV = parsedCV;

    // Prefill the form with stored data
    this.cvForm.patchValue({
      fullName: cv.fullName,
      email: cv.email,
      phone: cv.phone,
      location: cv.location,
      summary: cv.summary,
    });

    this.showCVPreview = false;
    this.aiMessage = `Editing "${cv.fullName}" - Make your changes and click "Save"`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Delete saved CV
   */
  deleteCV(cvId: string | number) {
    if (!confirm('Are you sure you want to delete this CV?')) {
      return;
    }

    this.http.delete(`http://localhost:3000/api/cv/${cvId}`).subscribe({
      next: (response) => {
        this.aiMessage = 'CV deleted successfully!';
        this.loadSavedCVs();
      },
      error: (error) => {
        this.aiError = error.error?.message || 'Failed to delete CV';
      },
    });
  }

  /**
   * Download saved CV
   */
  downloadSavedCV(cv: any, format: 'json' | 'docx' | 'pdf') {
    const cvData: ParsedCV = {
      personalInfo: {
        name: cv.fullName || '',
        email: cv.email || '',
        phone: cv.phone,
        location: cv.location,
      },
      summary: cv.summary,
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };
    const fileName = `${cvData.personalInfo.name.replace(/\s+/g, '_')}_CV`;

    if (format === 'json') {
      const dataStr = JSON.stringify(cvData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'docx' || format === 'pdf') {
      const cvText = this.formatCVAsText(cvData);
      const mimeType = format === 'pdf' ? 'text/plain' : 'application/msword';
      const ext = format === 'pdf' ? '.txt' : '.doc';
      const dataBlob = new Blob([cvText], { type: mimeType });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}${ext}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Cancel editing
   */
  cancelEdit() {
    this.editingCVId = null;
    this.displayedCV = null;
    this.showCVPreview = false;
    this.cvForm.reset();
    this.clearMessages();
  }

  /**
   * Handle form submission (for now just logs the data)
   */
  onSubmit() {
    if (this.cvForm.valid) {
      const cvData = this.cvForm.value as CVData;
      console.log('CV Data:', cvData);
      // For now, just log the data. Later this will be sent to the AI or saved to the database
    }
  }

  /**
   * Build ParsedCV object from current form data
   */
  private buildParsedCV(): ParsedCV {
    const formValue = this.cvForm.value;
    return {
      personalInfo: {
        name: formValue.fullName,
        email: formValue.email,
        phone: formValue.phone,
        location: formValue.location,
      },
      summary: formValue.summary,
      experience: formValue.experiences || [],
      education: formValue.educations || [],
      skills: formValue.skills || [],
      certifications: formValue.certifications,
    };
  }

  /**
   * Clear AI messages
   */
  private clearMessages() {
    this.aiMessage = '';
    this.aiError = '';
  }

  /**
   * Build CV - Improve language and display the CV
   */
  buildCV() {
    if (!this.cvForm.valid) {
      this.aiError = 'Please fill in all required fields before building your CV';
      return;
    }

    this.clearMessages();
    this.aiLoading = true;
    const cvData = this.buildParsedCV();

    this.aiService.improveCV(cvData).subscribe({
      next: (response) => {
        this.aiLoading = false;
        if (response.success) {
          this.displayedCV = response.data;
          this.showCVPreview = true;
          this.aiMessage = 'CV built successfully! You can now download it.';
        } else {
          this.aiError = response.message;
        }
      },
      error: (error) => {
        this.aiLoading = false;
        this.aiError = error.error?.message || 'Failed to build CV. Please try again.';
      },
    });
  }

  /**
   * Save CV - Generate download options (DOCX/PDF)
   */
  saveCV() {
    if (!this.displayedCV) {
      this.aiError = 'Please build your CV first';
      return;
    }
    // This will be handled by the template with download buttons
  }

  /**
   * Download CV as JSON
   */
  downloadCVAsJSON() {
    if (!this.displayedCV) return;

    const dataStr = JSON.stringify(this.displayedCV, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.displayedCV.personalInfo.name.replace(/\s+/g, '_')}_CV.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Download CV as PDF
   */
  downloadCVAsPDF() {
    if (!this.displayedCV) return;

    const cvText = this.formatCVAsText();
    const dataBlob = new Blob([cvText], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.displayedCV.personalInfo.name.replace(/\s+/g, '_')}_CV.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Download CV as DOCX (Text format for now)
   */
  downloadCVAsDOCX() {
    if (!this.displayedCV) return;

    const cvText = this.formatCVAsText();
    const dataBlob = new Blob([cvText], { type: 'application/msword' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.displayedCV.personalInfo.name.replace(/\s+/g, '_')}_CV.doc`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Format CV as text
   */
  private formatCVAsText(cvParam?: ParsedCV): string {
    const cv = cvParam || this.displayedCV;
    if (!cv) return '';

    let text = '';

    // Personal Info
    text += `${cv.personalInfo.name}\n`;
    if (cv.personalInfo.email) text += `Email: ${cv.personalInfo.email}\n`;
    if (cv.personalInfo.phone) text += `Phone: ${cv.personalInfo.phone}\n`;
    if (cv.personalInfo.location) text += `Location: ${cv.personalInfo.location}\n`;
    text += '\n';

    // Summary
    if (cv.summary) {
      text += `PROFESSIONAL SUMMARY\n${'='.repeat(50)}\n${cv.summary}\n\n`;
    }

    // Experience
    if (cv.experience && cv.experience.length > 0) {
      text += `WORK EXPERIENCE\n${'='.repeat(50)}\n`;
      cv.experience.forEach((exp) => {
        text += `${exp.position} at ${exp.company}\n`;
        if (exp.duration) text += `${exp.duration}\n`;
        if (exp.description) text += `${exp.description}\n\n`;
      });
      text += '\n';
    }

    // Education
    if (cv.education && cv.education.length > 0) {
      text += `EDUCATION\n${'='.repeat(50)}\n`;
      cv.education.forEach((edu) => {
        text += `${edu.degree} in ${edu.field}\n`;
        text += `${edu.institution}\n`;
        if (edu.graduationYear) text += `${edu.graduationYear}\n`;
        text += '\n';
      });
      text += '\n';
    }

    // Skills
    if (cv.skills && cv.skills.length > 0) {
      text += `SKILLS\n${'='.repeat(50)}\n`;
      text += cv.skills.join(', ') + '\n\n';
    }

    // Certifications
    if (cv.certifications && cv.certifications.length > 0) {
      text += `CERTIFICATIONS\n${'='.repeat(50)}\n`;
      cv.certifications.forEach((cert) => {
        text += `${cert.name} - ${cert.issuer}\n`;
        if (cert.date) text += `${cert.date}\n`;
        text += '\n';
      });
    }

    return text;
  }

  /**
   * Tailor CV for job
   */
  tailorCV() {
    if (!this.cvForm.valid) {
      this.aiError = 'Please fill in all required fields before tailoring';
      return;
    }

    if (!this.jobDescriptionInput.trim()) {
      this.aiError = 'Please enter a job description to tailor your CV';
      return;
    }

    this.clearMessages();
    this.aiLoading = true;
    const cvData = this.buildParsedCV();

    this.aiService.tailorCVForJob(cvData, this.jobDescriptionInput).subscribe({
      next: (response) => {
        this.aiLoading = false;
        if (response.success) {
          this.aiMessage = 'CV tailored for the job! Updating form...';
          // Update form with tailored data
          this.updateFormWithCV(response.data);
          this.jobDescriptionInput = ''; // Clear job description input
        } else {
          this.aiError = response.message;
        }
      },
      error: (error) => {
        this.aiLoading = false;
        this.aiError = error.error?.message || 'Failed to tailor CV. Please try again.';
      },
    });
  }

  /**
   * Generate interview questions
   */
  generateQuestions() {
    if (!this.cvForm.valid) {
      this.aiError = 'Please fill in all required fields before generating questions';
      return;
    }

    if (!this.jobDescriptionInput.trim()) {
      this.aiError = 'Please enter a job description to generate interview questions';
      return;
    }

    this.clearMessages();
    this.aiLoading = true;
    const cvData = this.buildParsedCV();

    this.aiService.generateInterviewQuestions(cvData, this.jobDescriptionInput).subscribe({
      next: (response) => {
        this.aiLoading = false;
        if (response.success) {
          const questionsText = response.data.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
          this.aiMessage = `Interview Questions Generated!\n\n${questionsText}`;
        } else {
          this.aiError = response.message;
        }
      },
      error: (error) => {
        this.aiLoading = false;
        this.aiError = error.error?.message || 'Failed to generate questions. Please try again.';
      },
    });
  }

  /**
   * Update form with improved/tailored CV data
   */
  private updateFormWithCV(cvData: ParsedCV) {
    this.cvForm.patchValue({
      fullName: cvData.personalInfo.name,
      email: cvData.personalInfo.email,
      phone: cvData.personalInfo.phone,
      location: cvData.personalInfo.location,
      summary: cvData.summary,
      skills: cvData.skills,
    });

    // Update experiences
    const expArray = this.cvForm.get('experiences') as FormArray;
    expArray.clear();
    cvData.experience.forEach((exp) => {
      expArray.push(
        this.fb.group({
          company: exp.company,
          position: exp.position,
          duration: exp.duration,
          description: exp.description,
        }),
      );
    });

    // Update educations
    const eduArray = this.cvForm.get('educations') as FormArray;
    eduArray.clear();
    cvData.education.forEach((edu) => {
      eduArray.push(
        this.fb.group({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          graduationYear: edu.graduationYear,
        }),
      );
    });
  }
}
