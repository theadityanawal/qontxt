import AuthButton from '@/components/AuthButton';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default async function AuthPage() {
  const user = await auth.currentUser;
  if (user) redirect('/dashboard');

  return (
    <div className="auth-page">
      <h1>Sign in to qontxt</h1>
      <AuthButton />
      <p className="windows-note">
        Windows users: Ensure pop-ups are enabled for Google sign-in
      </p>
    </div>
  );
}
