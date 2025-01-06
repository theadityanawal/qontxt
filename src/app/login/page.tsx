// src/app/login/page.tsx
import type { Metadata } from 'next';
import GoogleAuth from '@/components/auth/GoogleAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Login | qontxt',
  description: 'Sign in to qontxt to manage your AI-powered resumes',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-center text-3xl font-bold tracking-tight">
            Welcome to qontxt
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Sign in to manage your AI-powered resumes
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mt-2">
            <GoogleAuth />
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
