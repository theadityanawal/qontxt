import { OpenAI } from 'openai';
import type { AIProvider, AIAnalysisResult, JobAnalysis } from '../types';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private static instance: OpenAIProvider;

  private constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  static getInstance(): OpenAIProvider {
    if (!OpenAIProvider.instance) {
      OpenAIProvider.instance = new OpenAIProvider();
    }
    return OpenAIProvider.instance;
  }

  async analyzeJob(description: string): Promise<JobAnalysis> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: `You are a professional resume analyzer. Analyze the following job description and extract key components in a structured format.`
        }, {
          role: "user",
          content: description
        }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        keyRequirements: result.keyRequirements || [],
        technicalSkills: result.technicalSkills || [],
        softSkills: result.softSkills || [],
        roleResponsibilities: result.roleResponsibilities || [],
        experienceLevels: result.experienceLevels || { minimum: 0, preferred: 0 }
      };
    } catch (error) {
      console.error('Error analyzing job:', error);
      throw error;
    }
  }

  async tailorResume(baseResume: any, jobAnalysis: JobAnalysis): Promise<AIAnalysisResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: `You are a professional resume optimizer. Enhance the resume content to match the job requirements while maintaining factual accuracy.`
        }, {
          role: "user",
          content: JSON.stringify({
            resume: baseResume,
            jobAnalysis: jobAnalysis
          })
        }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        enhancedContent: result.enhancedContent,
        matchScore: result.matchScore || 0,
        suggestions: result.suggestions || [],
        matchedKeywords: result.matchedKeywords || []
      };
    } catch (error) {
      console.error('Error tailoring resume:', error);
      throw error;
    }
  }
}

