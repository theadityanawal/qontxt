import { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { settings } from '@/lib/settings';
import { UserSettingsSchema } from '@/types/settings';
import { z } from 'zod';

const UpdateSettingsSchema = z.object({
  profile: UserSettingsSchema.shape.profile.partial(),
  ai: UserSettingsSchema.shape.ai.partial()
}).partial();

export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized', code: 'AUTH_MISSING_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return Response.json(
        { error: 'Invalid token', code: 'AUTH_INVALID_TOKEN' },
        { status: 401 }
      );
    }

    const userSettings = await settings.getUserSettings(decodedToken.uid);
    return Response.json(userSettings);
  } catch (error) {
    errorTracker.captureError(error, {
      component: 'api/settings',
      operation: 'GET'
    });

    return Response.json(
      { error: 'Failed to fetch settings', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized', code: 'AUTH_MISSING_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return Response.json(
        { error: 'Invalid token', code: 'AUTH_INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const updates = UpdateSettingsSchema.parse(body);

    // Update settings
    const updatedSettings = await settings.updateSettings(decodedToken.uid, updates);

    return Response.json(updatedSettings);
  } catch (error) {
    errorTracker.captureError(error, {
      component: 'api/settings',
      operation: 'PATCH'
    });

    if (error.name === 'ZodError') {
      return Response.json(
        {
          error: 'Invalid request format',
          code: 'VALIDATION_ERROR',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to update settings', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
