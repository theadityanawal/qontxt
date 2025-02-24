import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface JobParserProps {
  jobDescription: string;
  onParseComplete?: (result: { requiredSkills: string[]; preferredSkills: string[] }) => void;
}

export function JobParser({ jobDescription, onParseComplete }: JobParserProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please paste a job description');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/parse-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to parse job description');
      }

      const result = await response.json();

      toast.success('Job requirements parsed successfully');

      if (onParseComplete) {
        onParseComplete(result);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while parsing the job description');
      toast.error('Failed to parse job requirements');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Job Description Parser</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Paste job description here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-48"
            disabled={isLoading}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Parse Job Description'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
