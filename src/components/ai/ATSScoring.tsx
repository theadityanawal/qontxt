import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AIAnalysisResult } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { type ATSScore } from '@/lib/ai-utils';

export interface ATSScoringProps {
  score: ATSScore;
  onRequestImprovement: () => Promise<void>;
  isAnalyzing: boolean;
}

export function ATSScoring({ score, onRequestImprovement, isAnalyzing }: ATSScoringProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          ATS Score
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {score.overall}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          {Object.entries(score.categories).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-medium">{value}%</span>
            </div>
          ))}
        </div>
        <Button
          className="w-full"
          size="sm"
          variant="outline"
          onClick={onRequestImprovement}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Improving...' : 'Improve with AI'}
        </Button>
      </CardContent>
    </Card>
  );
}

function ScoreBreakdown({ scores }: { scores: Record<string, number> }) {
  return (
    <div className="space-y-4">
      {Object.entries(scores).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-2">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span>{value}%</span>
          </div>
          <Progress value={value} />
        </div>
      ))}
    </div>
  );
}

function Feedback({
  strengths,
  weaknesses,
  suggestions
}: {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}) {
  return (
    <div className="space-y-4">
      <FeedbackSection title="Strengths" items={strengths} type="success" />
      <FeedbackSection title="Areas to Improve" items={weaknesses} type="warning" />
      <FeedbackSection title="Suggestions" items={suggestions} type="info" />
    </div>
  );
}

function FeedbackSection({
  title,
  items,
  type
}: {
  title: string;
  items: string[];
  type: 'success' | 'warning' | 'info';
}) {
  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className={`text-sm ${
              type === 'success'
                ? 'text-green-600'
                : type === 'warning'
                ? 'text-yellow-600'
                : 'text-blue-600'
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
