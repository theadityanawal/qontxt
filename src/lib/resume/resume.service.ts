import { ResumeData } from '@/types/resume.types';
import { ai } from '../ai/ai.service';
import { z } from 'zod';
import { redis } from '../redis';
import { metrics } from '../metrics';


class ResumeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ResumeError';
  }
}

export class ResumeService {
  private static instance: ResumeService;
  private cache: Map<string, { data: ResumeData; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): ResumeService {
    if (!ResumeService.instance) {
      ResumeService.instance = new ResumeService();
    }
    return ResumeService.instance;
  }

  public async getResume(userId: string, resumeId: string): Promise<ResumeData> {
    const cacheKey = `${userId}:${resumeId}`;
    const cached = this.getCachedResume(cacheKey);
    if (cached) return cached;

    try {
      const resume = await redis.get<ResumeData>(`resume:${resumeId}`);

      if (!resume) {
        throw new ResumeError(
          'Resume not found',
          'RESUME_NOT_FOUND',
          { userId, resumeId }
        );
      }

      if (resume.userId !== userId) {
        throw new ResumeError(
          'Unauthorized access',
          'UNAUTHORIZED_ACCESS',
          { userId, resumeId }
        );
      }

      this.setCachedResume(cacheKey, resume);
      return resume;
    } catch (error) {
      errorTracker.captureError(error, {
        userId,
        resumeId,
        operation: 'getResume'
      });

      if (error instanceof ResumeError) {
        throw error;
      }

      throw new ResumeError(
        'Failed to retrieve resume',
        'RETRIEVAL_ERROR',
        { userId, resumeId, originalError: error }
      );
    }
  }

  public async updateResume(
    userId: string,
    resumeId: string,
    updates: Partial<ResumeData>
  ): Promise<ResumeData> {
    try {
      const current = await this.getResume(userId, resumeId);
      const updated: ResumeData = {
        ...current,
        ...updates,
        metadata: {
          ...current.metadata,
          lastUpdated: new Date().toISOString()
        }
      };

      await redis.set(`resume:${resumeId}`, updated);
      this.setCachedResume(`${userId}:${resumeId}`, updated);

      await metrics.record('resume_update', 1, {
        userId,
        resumeId,
        sections: Object.keys(updates)
      });

      return updated;
    } catch (error) {
      errorTracker.captureError(error, {
        userId,
        resumeId,
        operation: 'updateResume'
      });

      if (error instanceof ResumeError) {
        throw error;
      }

      throw new ResumeError(
        'Failed to update resume',
        'UPDATE_ERROR',
        { userId, resumeId, originalError: error }
      );
    }
  }

  public async analyzeResume(
    userId: string,
    resumeId: string,
    jobDescription?: string
  ): Promise<void> {
    try {
      const resume = await this.getResume(userId, resumeId);

      // Start analysis tasks in parallel
      const [sectionAnalysis, atsScore, suggestions] = await Promise.all([
        this.analyzeSections(resume, jobDescription),
        this.updateATSScore(resume, jobDescription),
        this.generateSuggestions(resume, jobDescription)
      ]);

      // Update resume with analysis results
      await this.updateResume(userId, resumeId, {
        metadata: {
          ...resume.metadata,
          atsScore: atsScore.overall,
          analysis: {
            strengths: suggestions.strengths,
            weaknesses: suggestions.weaknesses,
            suggestions: suggestions.improvements
          }
        }
      });

      // Record metrics
      await metrics.record('resume_analysis', 1, {
        userId,
        resumeId,
        hasJobDescription: !!jobDescription,
        atsScore: atsScore.overall
      });
    } catch (error) {
      errorTracker.captureError(error, {
        userId,
        resumeId,
        operation: 'analyzeResume'
      });

      if (error instanceof ResumeError) {
        throw error;
      }

      throw new ResumeError(
        'Failed to analyze resume',
        'ANALYSIS_ERROR',
        { userId, resumeId, originalError: error }
      );
    }
  }

  private getCachedResume(key: string): ResumeData | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedResume(key: string, resume: ResumeData): void {
    this.cache.set(key, {
      data: resume,
      timestamp: Date.now()
    });
  }

  private async analyzeSections(resume: ResumeData, jobDescription?: string) {
    return ai.generateAnalysis({
      content: JSON.stringify(resume),
      section: 'all',
      jobDescription,
      mode: 'analyze'
    });
  }

  private async updateATSScore(resume: ResumeData, jobDescription?: string) {











export const resumeService = ResumeService.getInstance();// Export singleton instance}  }    return ai.generateSuggestions(resume, jobDescription);  private async generateSuggestions(resume: ResumeData, jobDescription?: string) {  }    return ai.generateATSScore(resume, jobDescription);
