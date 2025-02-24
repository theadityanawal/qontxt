import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// Base validation schemas
export const TimestampSchema = z.instanceof(Timestamp);
export const VisibilitySchema = z.enum(['public', 'private']);
export const EmploymentTypeSchema = z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']);
export const LanguageProficiencySchema = z.enum(['native', 'fluent', 'professional', 'basic']);
export const ResumeStatusSchema = z.enum(['draft', 'published', 'archived']);

// Core Schema Definitions
export const PersonalInfoSchema = z.object({
  name: z.string().min(1),
  headline: z.string(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string(),
    timezone: z.string().optional()
  }),
  social_links: z.array(z.object({
    platform: z.string(),
    url: z.string().url(),
    visibility: VisibilitySchema.optional()
  }))
});

export const WorkExperienceSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string(),
  employment_type: EmploymentTypeSchema,
  start_date: TimestampSchema,
  end_date: TimestampSchema.optional(),
  current: z.boolean(),
  descriptions: z.array(z.string()),
  achievements: z.array(z.string()),
  skills_used: z.array(z.string()),
  visibility: VisibilitySchema
});

export const EducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field_of_study: z.string(),
  start_date: TimestampSchema,
  end_date: TimestampSchema.optional(),
  grade: z.string().optional(),
  descriptions: z.array(z.string()),
  accreditation: z.string().optional()
});

export const ProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  role: z.string(),
  team_size: z.number().positive().optional(),
  technologies: z.array(z.string()),
  url: z.string().url().optional(),
  start_date: TimestampSchema,
  end_date: TimestampSchema.optional(),
  achievements: z.array(z.string()),
  media: z.array(z.string()).optional()
});

export const SkillCategorySchema = z.object({
  category: z.string(),
  skills: z.array(z.object({
    name: z.string(),
    proficiency: z.number().min(1).max(5),
    last_used: TimestampSchema.optional(),
    verified: z.boolean().optional()
  }))
});

export const CertificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string(),
  credential_id: z.string().optional(),
  issue_date: TimestampSchema,
  expiration_date: TimestampSchema.optional(),
  verification_url: z.string().url().optional()
});

export const LanguageSchema = z.object({
  language: z.string(),
  proficiency: LanguageProficiencySchema,
  certification: z.string().optional()
});

// Main Resume Schema
export const ResumeSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  version: z.enum(['base', 'generated']),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
  metadata: z.object({
    target_job: z.object({
      title: z.string(),
      company: z.string(),
      job_post_url: z.string().url().optional()
    }).optional(),
    status: ResumeStatusSchema,
    ats_score: z.number().min(0).max(100).optional()
  }),
  ai_metadata: z.object({
    last_analysis: TimestampSchema.optional(),
    job_match_score: z.number().min(0).max(100).optional(),
    keywords: z.array(z.string()).optional(),
    model_version: z.string().optional(),
    suggestions: z.array(z.string()).optional()
  }).optional()
});

// Frontend-specific types
export interface ResumeData {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  objective: string;
  summary: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    logo: StaticImageData | null;
  }>;
  education: Array<{
    id: string;
    degree: string;
    field: string;
    institution: string;
    graduationYear: string;
    logo: StaticImageData | null;
  }>;
  skills: Array<{ id: string; name: string }>;
}

export interface ResumeMetadata {
  id: string;
  title: string;
  lastModified: string;
  score?: number;
  status: 'draft' | 'published';
}

export type Resume = z.infer<typeof ResumeSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// Section type handling
export type ResumeSectionType =
  | 'personal_info'
  | 'work_experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'languages';

export type ResumeSection = {
  type: ResumeSectionType;
  data: PersonalInfo | WorkExperience | Education | Project | SkillCategory | Certification | Language;
};

// Type guards
export const isWorkExperience = (data: any): data is WorkExperience => {
  try {
    WorkExperienceSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const isEducation = (data: any): data is Education => {
  try {
    EducationSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const isProject = (data: any): data is Project => {
  try {
    ProjectSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export interface ResumeAnalysis {
  score: number;
  feedback: string[];
  suggestions: string[];
  [key: string]: {
    sections: {
      score: number;
      format: number;
      content: number;
      keywords: number;
      overall: number;
      improvements: string[];
    };
  };
}

export interface ATSCompatibility {
  score: number;
  feedback: string[];
  suggestions: string[];
  keywords: {
    found: string[];
    missing: string[];
  };
}
