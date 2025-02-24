import { AIService } from '@/lib/ai/ai.service';
import { auth } from '@/lib/firebase-admin';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { metrics } from '@/lib/metrics';
import { redis } from '@/lib/redis';

const aiService = AIService.getInstance();

const JobParseRequestSchema = z.object({
  content: z.string().min(100).max(10000),
  targetRole: z.string().optional(),
});

// Response validation schema
const JobParseResponseSchema = z.object({
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  experience: z.object({
    years: z.number(),
    level: z.string()
  }),
  education: z.array(z.string()),
  responsibilities: z.array(z.string()),
  technicalRequirements: z.object({
    tools: z.array(z.string()),
    platforms: z.array(z.string()),
    methodologies: z.array(z.string())
  }),
  softSkills: z.array(z.string()),
  benefits: z.array(z.string()),
  metadata: z.object({
    seniorityLevel: z.string(),
    employmentType: z.string(),
    workplaceType: z.string(),
    locations: z.array(z.string())
  })
});

const JOB_PARSE_PROMPT = `Analyze the following job description and extract structured information:

[CONTENT]

[TARGET_ROLE]

Provide the analysis in the following JSON format:
{
  "requiredSkills": string[],
  "preferredSkills": string[],
  "experience": {
    "years": number,
    "level": string
  },
  "education": string[],
  "responsibilities": string[],
  "technicalRequirements": {
    "tools": string[],
    "platforms": string[],
    "methodologies": string[]
  },
  "softSkills": string[],
  "benefits": string[],
  "metadata": {
    "seniorityLevel": string,
    "employmentType": string,
    "workplaceType": string,
    "locations": string[]
  }
}`;

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Input validation with schema
    const body = await req.json();
    const validatedData = JobParseRequestSchema.parse(body);

    // Content safety checks
    const sanitizedContent = contentSafety.sanitizeInput(validatedData.content, 'job');
    const sanitizedRole = validatedData.targetRole
      ? contentSafety.sanitizeInput(validatedData.targetRole, 'generic')
      : undefined;

    // Security risk assessment
    const securityCheckPassed = await contentSafety.checkSecurityRisks(
      sanitizedContent,
      'job',
      { route: '/api/ai/parse-job' }
    );

    if (!securityCheckPassed) {
      return new Response(
        JSON.stringify({
          error: 'Content security check failed',
          code: 'SECURITY_CHECK_FAILED'
        }),
        { status: 400 }
      );
    }

    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'AUTH_MISSING_TOKEN' }),
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return new Response(
        JSON.stringify({ error: 'Invalid token', code: 'AUTH_INVALID_TOKEN' }),
        { status: 401 }
      );
    }

    // Rate limiting
    const { success: rateLimitSuccess } = await rateLimit.check(
      `job_parse:${decodedToken.uid}`,
      { points: 1, duration: '1m' }
    );

    if (!rateLimitSuccess) {
      errorTracker.trackError(
        new Error('Rate limit exceeded'),
        'low',
        {
          userId: decodedToken.uid,
          route: '/api/ai/parse-job',
          metadata: { contentLength: sanitizedContent.length }
        }
      );

      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: 60
        }),
        { status: 429 }
      );
    }

    // Check cache first
    const cacheKey = redis.getJobParseKey(
      decodedToken.uid,
      sanitizedContent + (sanitizedRole || '')
    );

    const cachedResponse = await redis.get(cacheKey);
    if (cachedResponse) {
      // Validate cached response
      const validatedCache = contentSafety.validateOutput(
        cachedResponse,
        JobParseResponseSchema,
        'job'
      );

      await metrics.record('job_parse_cache_hit', 1, {
        userId: decodedToken.uid,
        contentLength: sanitizedContent.length
      });

      return new Response(JSON.stringify(validatedCache), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=3600'
        }
      });
    }

    // Generate prompt with sanitized content
    const prompt = JOB_PARSE_PROMPT
      .replace('[CONTENT]', sanitizedContent)
      .replace(
        '[TARGET_ROLE]',
        sanitizedRole
          ? `Target Role Context: ${sanitizedRole}`
          : ''
      );

    try {
      const response = await aiService.generateCompletion({
        prompt,
        temperature: 0.1,
        maxTokens: 1000
      });

      // Parse and validate response
      const parsedResponse = JSON.parse(response.text);

      // Validate and sanitize the AI response
      const validatedResponse = contentSafety.validateOutput(
        parsedResponse,
        JobParseResponseSchema,
        'job'
      );

      // Cache the validated response
      await redis.set(cacheKey, validatedResponse, 24 * 60 * 60);

      // Record metrics
      await metrics.record('job_parse', 1, {
        userId: decodedToken.uid,
        success: true,
        responseTime: Date.now() - startTime,
        contentLength: sanitizedContent.length,
        requiredSkillsCount: validatedResponse.requiredSkills.length,
        preferredSkillsCount: validatedResponse.preferredSkills.length,
        cached: false
      });

      return new Response(JSON.stringify(validatedResponse), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=3600',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    } catch (error) {
      errorTracker.trackError(
        error instanceof Error ? error : new Error('Job parsing failed'),
        'high',
        {
          userId: decodedToken.uid,
          route: '/api/ai/parse-job',
          metadata: {
            contentLength: sanitizedContent.length,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      );

      // Record failure metrics
      await metrics.record('job_parse_error', 1, {
        userId: decodedToken.uid,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
        contentLength: sanitizedContent.length
      });

      throw error;
    }
  } catch (error) {
    errorTracker.trackError(
      error instanceof Error ? error : new Error('Unknown error in job parsing'),
      'high',
      {
        route: '/api/ai/parse-job',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    );

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.issues
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}
