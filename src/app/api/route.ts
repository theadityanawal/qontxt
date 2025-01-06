// app/api/auth/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const userData = await req.json();
  const functionsUrl = process.env.FIREBASE_FUNCTIONS_URL;

  const response = await fetch(`${functionsUrl}/handleGoogleAuth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  return NextResponse.json(await response.json());
}
