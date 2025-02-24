import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';
import { AIService } from '@/lib/ai/ai.service';
import { JobAnalysis, AIAnalysisResult } from '@/lib/ai/types';
import { toast } from 'sonner';

interface ResumeAnalyzerProps {
  baseResume: any;
  userId: string;
}

export function ResumeAnalyzer({ baseResume, userId }: ResumeAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [tailoredResult, setTailoredResult] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsAnalyzing(true);
    try {
      const aiService = AIService.getInstance();
      const jobAnalysis = await aiService.analyzeJobDescription(userId, jobDescription);
      setAnalysis(jobAnalysis);

      const result = await aiService.tailorResume(userId, baseResume, jobAnalysis);
      setTailoredResult(result);

      toast.success('Resume analysis completed');
    } catch (error) {
      toast.error('Error analyzing resume. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Resume Analyzer</h2>
        <textarea
          className="w-full min-h-[200px] p-2 border rounded-md"
          placeholder="Paste job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <Button
          className="mt-4"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze & Tailor Resume'}
        </Button>
      </Card>

      {analysis && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Job Analysis</h3>
          <div className="space-y-2">
            <SkillSection title="Key Requirements" items={analysis.keyRequirements} />
            <SkillSection title="Technical Skills" items={analysis.technicalSkills} />
            <SkillSection title="Soft Skills" items={analysis.softSkills} />
          </div>
        </Card>
      )}

      {tailoredResult && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Tailoring Results</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Match Score:</span>
              <span className="font-semibold">{Math.round(tailoredResult.matchScore * 100)}%</span>
            </div>
            <div>
              <h4 className="font-medium mb-2">Suggestions:</h4>
              <ul className="list-disc pl-5">
                {tailoredResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function SkillSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-medium mb-2">{title}:</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <HoverCard key={index}>
            <HoverCardTrigger>
              <span className="px-2 py-1 bg-primary/10 rounded-md text-sm">
                {item}
              </span>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="text-sm">
                <p>Matched in resume: {tailoredResult?.matchedKeywords.includes(item) ? 'Yes' : 'No'}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
