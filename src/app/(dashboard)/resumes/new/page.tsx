'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createNewResume } from '@/lib/services/resume';
import { useAuth } from '@/lib/services/auth/auth.service';

const resumeTemplates = [
  {
    id: 'blank',
    title: 'Blank Resume',
    description: 'Start from scratch with a clean slate',
    icon: '📝'
  },
  {
    id: 'professional',
    title: 'Professional Template',
    description: 'Perfect for corporate and traditional roles',
    icon: '👔'
  },
  {
    id: 'creative',
    title: 'Creative Template',
    description: 'Stand out with a modern, creative layout',
    icon: '🎨'
  },
  {
    id: 'technical',
    title: 'Technical Template',
    description: 'Optimized for technical and engineering roles',
    icon: '💻'
  }
];

export default function NewResumePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreateResume = async (templateId: string) => {
    if (!user) return;

    setIsCreating(true);
    try {
      const resumeId = await createNewResume(user.uid, `New Resume - ${new Date().toLocaleDateString()}`);
      router.push(`/dashboard/resumes/${resumeId}`);
    } catch (error) {
      console.error('Error creating resume:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create New Resume</h1>
          <p className="text-muted-foreground mt-2">Choose a template to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {resumeTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span role="img" aria-label={template.title}>{template.icon}</span>
                  {template.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/resumes')}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleCreateResume(selectedTemplate || 'blank')}
            disabled={isCreating || !selectedTemplate}
          >
            {isCreating ? 'Creating...' : 'Create Resume'}
          </Button>
        </div>
      </div>
    </div>
  );

