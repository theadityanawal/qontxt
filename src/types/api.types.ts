import { z } from 'zod';
import { ATSCompatibility, ResumeAnalysis } from '@/types/resume.types';

export const AIRequestSchema = z.object({
  prompt: z.string(),
  modelName: z.string().optional(),
  options: z.object({
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().positive().optional(),
    stream: z.boolean().optional()
  }).optional()
});

export const AnalyzeRequestSchema = z.object({
  content: z.string().min(50),
  section: z.string(),
  jobDescription: z.string().optional(),
  modelName: z.string().optional(),
  mode: z.enum(['analyze', 'improve'])
});

export const AnalyzeResponseSchema = z.object({
  analysis: z.object({
    score: z.number().min(0).max(100),
    feedback: z.array(z.string()),
    suggestions: z.array(z.string())
  }),
  atsCompatibility: z.object({
    overall: z.number().min(0).max(100),
    format: z.number().min(0).max(100),
    content: z.number().min(0).max(100),
    keywords: z.number().min(0).max(100),
    improvements: z.array(z.string())
  }),
  metadata: z.object({
    modelUsed: z.string(),
    processingTime: z.number(),
    cached: z.boolean()
  })
});

export type AIRequest = z.infer<typeof AIRequestSchema>;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}
