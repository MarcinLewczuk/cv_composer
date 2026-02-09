/**
 * CV-related TypeScript interfaces
 * Matches the MySQL schema structure
 */

export interface Skill {
  skill?: string;
  [key: string]: any;
}

export interface Experience {
  company: string;
  position: string;
  duration?: string;
  description?: string;
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
}

export interface ParsedCVStructure {
  personalInfo: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  certifications?: Certification[];
}

export interface ImprovedCVStructure extends ParsedCVStructure {
  improvements?: string[];
}

export interface ReviewResult {
  isValid: boolean;
  structureIssues: string[];
  styleIssues: string[];
  recommendations: string[];
  summary?: string;
}

export interface CV {
  id?: number;
  originalContent: string;
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  certifications?: Certification[];
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
