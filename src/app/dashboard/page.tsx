'use client';
import { useResumes } from '@/lib/resume';
import Link from 'next/link';

export default function DashboardPage() {
  const { resumes, loading } = useResumes();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Resumes</h1>
        <Link
          href="/resume/new"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Create New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No resumes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map(resume => (
            <Link
              key={resume.id}
              href={`/resume/${resume.id}`}
              className="p-4 border rounded-lg hover:border-primary transition-colors"
            >
              <h2 className="font-semibold mb-2">{resume.title}</h2>
              <p className="text-sm text-muted-foreground">
                Last updated: {resume.updatedAt.toLocaleDateString()}
              </p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  resume.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {resume.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
