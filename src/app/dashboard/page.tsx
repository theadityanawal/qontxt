import AuthButton from '@/components/AuthButton';

export default function DashboardPage() {
  return (
    <main>
      <h2>Your Resumes</h2>
      <div className="resume-list">
        {/* Placeholder for resume items */}
        <p>No resumes created yet</p>
      </div>
      <AuthButton />
    </main>
  );
}
