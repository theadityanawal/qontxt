// src/app/login/page.tsx
import GoogleAuth from '@/components/auth/GoogleAuth';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-6">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome to qontxt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your resumes
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <GoogleAuth />
        </div>
      </div>
    </div>
  );
}
