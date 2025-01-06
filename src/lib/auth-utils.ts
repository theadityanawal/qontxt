// src/lib/auth-utils.ts
import { cookies } from 'next/headers';

export async function validateSession() {
  const session = cookies().get('session')?.value;

  if (!session) {
    return { isAuthenticated: false };
  }

  try {
    // Call API route to verify session
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify`, {
      headers: {
        Cookie: `session=${session}`
      }
    });

    if (!response.ok) {
      return { isAuthenticated: false };
    }

    const data = await response.json();
    return {
      isAuthenticated: true,
      uid: data.uid
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}
