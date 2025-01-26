import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase';
import AuthButton from '@/components/AuthButton';

export default async function Home() {
  const user = await auth.currentUser;
  if (user) redirect('/dashboard');

  return (
    <div className="home-page">
      <h1>Welcome to qontxt</h1>
      <p>Create AI-powered tailored resumes</p>
      <AuthButton />
    </div>
  );
}
