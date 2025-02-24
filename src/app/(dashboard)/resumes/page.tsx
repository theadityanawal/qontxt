'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ResumeMetadata } from '@/types/resume';

const mockResumes: ResumeMetadata[] = [
  {
    id: '1',
    title: 'Software Engineer Resume',
    lastModified: '2024-01-15',
    score: 85,
    status: 'published'
  },
  {
    id: '2',
    title: 'Product Manager Resume',
    lastModified: '2024-01-10',
    score: 78,
    status: 'draft'
  }
];

export default function ResumesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
          <p className="text-muted-foreground mt-2">Manage and edit your resumes</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/resumes/new">Create New Resume</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {mockResumes.map((resume) => (
          <Link key={resume.id} href={`/dashboard/resumes/${resume.id}`}>
            <Card className="hover:shadow-md transition-all">
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{resume.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Last modified: {new Date(resume.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {resume.score !== undefined && (
                    <Card className="bg-muted">
                      <CardContent className="p-2">
                        <span className="text-sm font-medium">Score: {resume.score}%</span>
                      </CardContent>
                    </Card>
                  )}
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    resume.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                  </span>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

