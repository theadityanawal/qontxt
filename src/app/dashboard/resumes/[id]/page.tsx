'use client';

import { ResumeEditor } from '@/components/ResumeEditor';
import { ResumeData } from '@/types/resume.types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { StaticImageData } from 'next/image';

export default function ResumePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleSave = async (data: ResumeData) => {
    console.log('Saving resume data:', data);
    // TODO: Implement actual save functionality
  };

  // Mock data - replace with actual data fetching
  const mockResumeData: ResumeData = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    website: 'johndoe.com',
    objective: 'To obtain a challenging position as a software engineer where I can utilize my skills and experience to contribute to the success of the organization.',
    summary: 'Experienced software engineer with a focus on frontend development and user experience.',
    experience: [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'Tech Corp',
        startDate: '2021',
        endDate: 'Present',
        description: 'Led development of modern web applications using React and TypeScript.',
        logo: null as any,
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of Technology',
        graduationYear: '2020',
        logo: null as any,
      }
    ],
    skills: [{ id: '1', name: 'React' }, { id: '2', name: 'TypeScript' }, { id: '3', name: 'Next.js' }, { id: '4', name: 'TailwindCSS' }]
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Editing Resume</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/resumes')}>
              Cancel
            </Button>
            <Button onClick={() => handleSave(mockResumeData)}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResumeEditor
          initialData={mockResumeData}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
