'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/types/resume.types';

interface ResumeEditorProps {
  initialData?: ResumeData;
  onSave?: (data: ResumeData) => Promise<void>;
}

export function ResumeEditor({ initialData, onSave }: ResumeEditorProps) {
  const [data, setData] = useState<ResumeData>(initialData || {
    id: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    objective: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(data);
      alert('Saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ResumeData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resume Editor</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={data.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={data.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <textarea
              className="w-full p-2 border rounded min-h-[100px]"
              value={data.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              placeholder="Write a professional summary..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience Section - MVP Simplified */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index} className="border p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <input
                    type="text"
                    className="w-full p-2 border rounded mr-2"
                    value={exp.title}
                    onChange={(e) => {
                      const newExp = [...data.experience];
                      newExp[index] = { ...exp, title: e.target.value };
                      handleChange('experience', newExp);
                    }}
                    placeholder="Job Title"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newExp = data.experience.filter((_, i) => i !== index);
                      handleChange('experience', newExp);
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={exp.company}
                  onChange={(e) => {
                    const newExp = [...data.experience];
                    newExp[index] = { ...exp, company: e.target.value };
                    handleChange('experience', newExp);
                  }}
                  placeholder="Company"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={exp.startDate}
                    onChange={(e) => {
                      const newExp = [...data.experience];
                      newExp[index] = { ...exp, startDate: e.target.value };
                      handleChange('experience', newExp);
                    }}
                    placeholder="Start Date"
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={exp.endDate}
                    onChange={(e) => {
                      const newExp = [...data.experience];
                      newExp[index] = { ...exp, endDate: e.target.value };
                      handleChange('experience', newExp);
                    }}
                    placeholder="End Date"
                  />
                </div>
                <textarea
                  className="w-full p-2 border rounded min-h-[100px]"
                  value={exp.description}
                  onChange={(e) => {
                    const newExp = [...data.experience];
                    newExp[index] = { ...exp, description: e.target.value };
                    handleChange('experience', newExp);
                  }}
                  placeholder="Description"
                />
              </div>
            ))}
            <Button
              onClick={() => {
                const newExp = [
                  ...data.experience,
                  {
                    id: `exp-${Date.now()}`,
                    title: '',
                    company: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                    logo: null
                  }
                ];
                handleChange('experience', newExp);
              }}
            >
              Add Experience
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Education Section - MVP Simplified */}
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index} className="border p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <input
                    type="text"
                    className="w-full p-2 border rounded mr-2"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...data.education];
                      newEdu[index] = { ...edu, degree: e.target.value };
                      handleChange('education', newEdu);
                    }}
                    placeholder="Degree"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newEdu = data.education.filter((_, i) => i !== index);
                      handleChange('education', newEdu);
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={edu.field}
                  onChange={(e) => {
                    const newEdu = [...data.education];
                    newEdu[index] = { ...edu, field: e.target.value };
                    handleChange('education', newEdu);
                  }}
                  placeholder="Field of Study"
                />
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={edu.institution}
                  onChange={(e) => {
                    const newEdu = [...data.education];
                    newEdu[index] = { ...edu, institution: e.target.value };
                    handleChange('education', newEdu);
                  }}
                  placeholder="Institution"
                />
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={edu.graduationYear}
                  onChange={(e) => {
                    const newEdu = [...data.education];
                    newEdu[index] = { ...edu, graduationYear: e.target.value };
                    handleChange('education', newEdu);
                  }}
                  placeholder="Graduation Year"
                />
              </div>
            ))}
            <Button
              onClick={() => {
                const newEdu = [
                  ...data.education,
                  {
                    id: `edu-${Date.now()}`,
                    degree: '',
                    field: '',
                    institution: '',
                    graduationYear: '',
                    logo: null
                  }
                ];
                handleChange('education', newEdu);
              }}
            >
              Add Education
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section - MVP Simplified */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              className="w-full p-2 border rounded min-h-[100px]"
              value={data.skills.map(s => s.name).join(', ')}
              onChange={(e) => {
                const skillNames = e.target.value.split(',').map(s => s.trim());
                const newSkills = skillNames.filter(Boolean).map(name => ({
                  id: `skill-${name}`,
                  name
                }));
                handleChange('skills', newSkills);
              }}
              placeholder="Enter your skills, separated by commas..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
