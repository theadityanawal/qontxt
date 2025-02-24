import { ResumeData } from '@/types/resume.types';
import { AIService } from './ai/ai.service';
import { z } from 'zod';

const aiService = AIService.getInstance();

// Initialize AI service with Gemini configuration
aiService.initialize({
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    modelName: 'gemini-2.0-flash-001',
    temperature: 0.7,
  }
});

// Validation schemas
const ATSScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  categories: z.object({
    keywordMatch: z.number().min(0).max(100),
    formatCompliance: z.number().min(0).max(100),
    contentQuality: z.number().min(0).max(100),
    relevance: z.number().min(0).max(100)
  }),
  improvements: z.array(z.string())
});

const AIAnalysisResultSchema = z.object({
  score: ATSScoreSchema,
  keywords: z.object({
    found: z.array(z.string()),
    missing: z.array(z.string())
  }),
  analysis: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string())
  })
});

export type ATSScore = z.infer<typeof ATSScoreSchema>;
export type AIAnalysisResult = z.infer<typeof AIAnalysisResultSchema>;

class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// Performance optimization: Debounce analysis requests
const analysisDebounceMap = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_DELAY = 1000; // 1 second

export async function analyzeResumeContent(
  section: string,
  content: string,
  jobDescription?: string
): Promise<AIAnalysisResult> {
  // Clear any pending analysis for this section
  const debounceKey = `${section}:${content}`;
  const existingTimeout = analysisDebounceMap.get(debounceKey);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  return new Promise((resolve, reject) => {
    analysisDebounceMap.set(
      debounceKey,
      setTimeout(async () => {
        try {
          const prompt = generateAnalysisPrompt(section, content, jobDescription);
          const response = await aiService.generateCompletion({
            prompt,
            temperature: 0.3
          });

          const result = JSON.parse(response.text);
          const validatedResult = AIAnalysisResultSchema.parse(result);
          resolve(validatedResult);
        } catch (error) {
          if (error instanceof z.ZodError) {
            reject(new AIError(
              'Invalid AI response format',
              'VALIDATION_ERROR',
              { zodError: error.issues }
            ));
          } else if (error instanceof Error) {
            reject(new AIError(
              'AI analysis failed',
              'ANALYSIS_ERROR',
              { originalError: error.message }
            ));
          }
          reject(error);
        } finally {
          analysisDebounceMap.delete(debounceKey);
        }
      }, DEBOUNCE_DELAY)
    );
  });
}

export async function generateImprovedContent(
  section: string,
  content: string,
  jobDescription: string
): Promise<{ content: string; score: ATSScore }> {
  try {
    const prompt = generateOptimizationPrompt(section, content, jobDescription);
    const response = await aiService.generateCompletion({
      prompt,
      temperature: 0.7
    });

    const result = JSON.parse(response.text);
    return {
      content: result.content,
      score: ATSScoreSchema.parse(result.score)
    };
  } catch (error) {
    throw new AIError(
      'Content improvement failed',
      'IMPROVEMENT_ERROR',
      { section, originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}

// Constants for content rules and validation
export const ANALYSIS_RULES = {
  minimumScore: {
    overall: 70,
    keywordMatch: 60,
    formatCompliance: 75,
    contentQuality: 65,
    relevance: 70
  },
  contentGuidelines: {
    bulletPoints: {
      minLength: 30,
      maxLength: 100,
      startWithAction: true,
      forbiddenPhrases: [
        'responsible for',
        'worked on',
        'helped with',
        'assisted in'
      ]
    },
    sections: {
      summary: {
        minWords: 50,
        maxWords: 200,
        keywordDensity: 0.05
      },
      experience: {
        minBullets: 3,
        maxBullets: 6,
        requireMetrics: true
      },
      skills: {
        minSkills: 5,
        maxSkills: 15,
        groupByType: true
      }
    }
  }
};

// Helper function to validate content against rules
export function validateContentAgainstRules(
  section: string,
  content: string
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  const rules = ANALYSIS_RULES.contentGuidelines;
  const words = content.split(/\s+/).filter(Boolean);
  const bulletPoints = content.split('\n').filter(line => line.trim().startsWith('•'));

  try {
    // Generic content checks
    if (rules.bulletPoints.forbiddenPhrases.some(phrase =>
      content.toLowerCase().includes(phrase.toLowerCase())
    )) {
      issues.push('Contains weak or passive phrases');
    }

    // Section-specific validation
    switch (section) {
      case 'summary':
        validateSummarySection(words.length, issues);
        break;
      case 'experience':
        validateExperienceSection(bulletPoints, content, issues);
        break;
      case 'skills':
        validateSkillsSection(content, issues);
        break;
    }
  } catch (error) {
    console.error('Validation error:', error);
    issues.push('An error occurred during validation');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

function validateSummarySection(wordCount: number, issues: string[]): void {
  const rules = ANALYSIS_RULES.contentGuidelines.sections.summary;
  if (wordCount < rules.minWords) {
    issues.push(`Summary too short (minimum ${rules.minWords} words)`);
  }
  if (wordCount > rules.maxWords) {
    issues.push(`Summary too long (maximum ${rules.maxWords} words)`);
  }
}

function validateExperienceSection(bulletPoints: string[], content: string, issues: string[]): void {
  const rules = ANALYSIS_RULES.contentGuidelines.sections.experience;
  if (bulletPoints.length < rules.minBullets) {
    issues.push(`Add more bullet points (minimum ${rules.minBullets})`);
  }
  if (!content.match(/\d+/)) {
    issues.push('Add quantifiable achievements or metrics');
  }
}

function validateSkillsSection(content: string, issues: string[]): void {
  const rules = ANALYSIS_RULES.contentGuidelines.sections.skills;
  const skillCount = content.split(',').filter(Boolean).length;
  if (skillCount < rules.minSkills) {
    issues.push(`Add more relevant skills (minimum ${rules.minSkills})`);
  }
  if (skillCount > rules.maxSkills) {
    issues.push(`Too many skills listed (maximum ${rules.maxSkills})`);
  }
}

// Helper functions for generating prompts



function generateAnalysisPrompt(section: string, content: string, jobDescription?: string): string {
  return `Analyze the following ${section} section of a resume:
Content: ${content}
${jobDescription ? `Job Description:\n${jobDescription}\n` : ''}
Provide analysis in the following JSON format:
{
  "score": {
    "overall": number,
    "categories": {
      "keywordMatch": number,
      "formatCompliance": number,
      "contentQuality": number,
      "relevance": number
    }
  },
  "keywords": {
    "found": string[],
    "missing": string[]
  },
  "analysis": {
    "strengths": string[],
    "weaknesses": string[]
  },
  "improvements": string[]
}`;
}

function generateOptimizationPrompt(section: string, content: string, jobDescription: string): string {
  return `Improve the following ${section} section of a resume to maximize ATS compatibility:
Original Content: ${content}
Job Description: ${jobDescription}
Focus on:
1. Using strong action verbs
2. Adding quantifiable achievements
3. Improving clarity and impact
4. Optimizing for ATS systems
5. Professional tone and formatting
6. Industry-standard terminology
Provide the response in the following JSON format:
{
  "content": string,
  "score": {
    "overall": number,
    "categories": {
      "keywordMatch": number,
      "formatCompliance": number,
      "contentQuality": number,
      "relevance": number
    }
  }
}`;
}
