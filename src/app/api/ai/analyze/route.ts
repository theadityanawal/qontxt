import { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { rateLimit } from '@/lib/rate-limit';
import { metrics } from '@/lib/metrics';
import { redis } from '@/lib/redis';
import { ai } from '@/lib/ai/ai.service';
import { settings } from '@/lib/settings';
import {
  AnalyzeRequestSchema,
  AnalyzeResponse,
  ErrorResponse
} from '@/types/api.types';
import { TIER_LIMITS } from '@/types/settings';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Input validation
    const body = await req.json();
    const validatedData = AnalyzeRequestSchema.parse(body);

    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return createErrorResponse('AUTH_MISSING_TOKEN', 'Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return createErrorResponse('AUTH_INVALID_TOKEN', 'Invalid token', 401);
    }

    // Get user settings and check tier limits
    const userSettings = await settings.getUserSettings(decodedToken.uid);
    const tierLimits = TIER_LIMITS[userSettings.usage.tier];

    if (userSettings.usage.aiRequests >= tierLimits.aiRequests) {
      return createErrorResponse(
        'USAGE_LIMIT_EXCEEDED',
        'Usage limit exceeded',
        429,
        {
          tier: userSettings.usage.tier,
          limit: tierLimits.aiRequests
        }
      );
    }

    // Rate limiting
    const { success: rateLimitSuccess } = await rateLimit.check(
      `analyze:${decodedToken.uid}`,
      { points: 1, duration: '1m' }
    );

    if (!rateLimitSuccess) {
      return createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Rate limit exceeded',
        429,
        { retryAfter: 60 }
      );
    }

    // Use model from user settings if not specified
    const modelName = validatedData.modelName || userSettings.preferences.aiModel;

    // Validate model access
    if (!tierLimits.features.includes(modelName)) {
      return createErrorResponse(
        'MODEL_NOT_AVAILABLE',
        'Model not available in current tier',
        403,
        { requiredTier: 'pro' }
      );
    }

    // Check cache
    const cacheKey = `analysis:${decodedToken.uid}:${validatedData.section}:${validatedData.content}`;
    const cachedResponse = await redis.get<AnalyzeResponse>(cacheKey);

    if (cachedResponse) {
      await metrics.record('ai_analysis_cache_hit', 1, {
        userId: decodedToken.uid,
        section: validatedData.section,
        mode: validatedData.mode,
        model: modelName
      });
      return Response.json(cachedResponse);
    }

    // Generate analysis
    const response = await ai.generateAnalysis({
      content: validatedData.content,
      section: validatedData.section,
      jobDescription: validatedData.jobDescription,
      mode: validatedData.mode,
      modelName
    });

    // Cache response
    await redis.set(cacheKey, response, 3600);

    // Record metrics
    await metrics.record('ai_analysis', 1, {
      userId: decodedToken.uid,
      section: validatedData.section,
      mode: validatedData.mode,
      model: modelName,
      latency: Date.now() - startTime,
      cached: false
    });

    return Response.json(response);
  } catch (error) {
    errorTracker.captureError(error, {
      component: 'api/ai/analyze',
      timestamp: new Date().toISOString()
    });

    if (error.name === 'ZodError') {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request format',
        400,
        { details: error.issues }
      );
    }

    return createErrorResponse(
      'INTERNAL_ERROR',
      'Analysis failed',
      500
    );
  }
}

function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
): Response {
  const error: ErrorResponse = { error: message, code };
  if (details) error.details = details;
  return Response.json(error, { status });
}
