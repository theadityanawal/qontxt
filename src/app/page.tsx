import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/firebase-admin';
import AuthButton from '@/components/AuthButton';

export default async function Home() {
  const session = cookies().get('session')?.value;
  if (session) {
    const decodedClaims = await verifySessionCookie(session);
    if (decodedClaims) {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
      <h1 className="text-4xl font-bold">Welcome to qontxt</h1>
      <p className="text-muted-foreground">Create AI-powered tailored resumes</p>
      <AuthButton />
    </div>
  );
}

