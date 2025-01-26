import { Timestamp } from 'firebase/firestore';

// Core Resume Interface
export interface Resume {
  id: string;
  user_id: string;
  version: 'base' | 'generated';
  created_at: Timestamp;
  updated_at: Timestamp;
  metadata: {
    target_job?: {
      title: string;
      company: string;
      job_post_url?: string;
    };
    status: 'draft' | 'published' | 'archived';
  };
  ai_metadata?: {
    job_match_score: number;
    keywords?: string[];
    model_version?: string;
  };
}

// Section Types
export interface PersonalInfo {
  name: string;
  headline: string;
  contact: {
    email: string;
    phone?: string;
    location: string;
    timezone?: string;
  };
  social_links: Array<{
    platform: string;
    url: string;
    visibility?: 'public' | 'private';
  }>;
}

export interface WorkExperience {
  title: string;
  company: string;
  location: string;
  employment_type: 'full-time' | 'contract' | 'freelance';
  start_date: Timestamp;
  end_date?: Timestamp;
  current: boolean;
  descriptions: string[];
  achievements: string[];
  skills_used: string[];
  visibility: 'public' | 'private';
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: Timestamp;
  end_date?: Timestamp;
  grade?: string;
  descriptions: string[];
  accreditation?: string;
}

export interface Project {
  title: string;
  description: string;
  role: string;
  team_size?: number;
  technologies: string[];
  url?: string;
  start_date: Timestamp;
  end_date?: Timestamp;
  achievements: string[];
  media?: string[];
}

export interface SkillCategory {
  category: string;
  skills: Array<{
    name: string;
    proficiency: 1 | 2 | 3 | 4 | 5;
    last_used?: Timestamp;
    verified?: boolean;
  }>;
}

export interface Certification {
  name: string;
  issuer: string;
  credential_id?: string;
  issue_date: Timestamp;
  expiration_date?: Timestamp;
  verification_url?: string;
}

export interface Language {
  language: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'basic';
  certification?: string;
}

// Union Type for Section Documents
export type ResumeSection =
  | { type: 'personal_info'; data: PersonalInfo }
  | { type: 'work_experience'; data: WorkExperience }
  | { type: 'education'; data: Education }
  | { type: 'projects'; data: Project }
  | { type: 'skills'; data: SkillCategory }
  | { type: 'certifications'; data: Certification }
  | { type: 'languages'; data: Language };
