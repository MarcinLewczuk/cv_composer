import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import { CVParseService, CVData, Experience, Education, Certification } from '../../services/CVParseService';

@Component({
  selector: 'app-cv-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cv-editor.component.html',
  styleUrls: ['./cv-editor.component.css']
})
export class CVEditorComponent implements OnInit {
  cvForm!: FormGroup;
  expandedSections = {
    personal: true,
    experiences: false,
    educations: false,
    certifications: false,
    skills: false
  };

  constructor(private fb: FormBuilder, private cvParseService: CVParseService) {}

  ngOnInit() {
    this.initializeForm();
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
      skills: this.fb.array(this.createSkillFormControls(emptyCv.skills))
    });
  }

  /**
   * Create experience form groups
   */
  private createExperienceFormGroups(experiences: Experience[]) {
    return experiences.map(exp =>
      this.fb.group({
        company: [exp.company, Validators.required],
        position: [exp.position, Validators.required],
        duration: [exp.duration],
        description: [exp.description]
      })
    );
  }

  /**
   * Create education form groups
   */
  private createEducationFormGroups(educations: Education[]) {
    return educations.map(edu =>
      this.fb.group({
        institution: [edu.institution, Validators.required],
        degree: [edu.degree, Validators.required],
        field: [edu.field, Validators.required],
        graduationYear: [edu.graduationYear]
      })
    );
  }

  /**
   * Create certification form groups
   */
  private createCertificationFormGroups(certifications: Certification[]) {
    return certifications.map(cert =>
      this.fb.group({
        name: [cert.name, Validators.required],
        issuer: [cert.issuer, Validators.required],
        date: [cert.date]
      })
    );
  }

  /**
   * Create skill form controls
   */
  private createSkillFormControls(skills: string[]) {
    return skills.map(skill =>
      this.fb.control(skill, Validators.required)
    );
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
        description: ['']
      })
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
        graduationYear: ['']
      })
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
        date: ['']
      })
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
   * Handle form submission (for now just logs the data)
   */
  onSubmit() {
    if (this.cvForm.valid) {
      const cvData = this.cvForm.value as CVData;
      console.log('CV Data:', cvData);
      // For now, just log the data. Later this will be sent to the AI or saved to the database
    }
  }
}
