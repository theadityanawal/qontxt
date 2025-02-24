'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/types/resume';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { TextEditor } from './TextEditor';
import { ErrorBoundary } from './ErrorBoundary';
import { ATSScoring } from './ai/ATSScoring';
import { JobParser } from './ai/JobParser';
import { analyzeResumeContent, generateImprovedContent, validateContentAgainstRules, type ATSScore } from '@/lib/services/ai/ai-utils';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schemas
const EditorSectionSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    placeholder: z.string()
});

type EditorSection = z.infer<typeof EditorSectionSchema>;

interface ResumeEditorProps {
    initialData?: ResumeData;
    onSave?: (data: ResumeData) => Promise<void>;
}

const AUTOSAVE_DELAY = 1000; // 1 second

export function ResumeEditor({ initialData, onSave }: ResumeEditorProps) {
    const [sections, setSections] = useState<EditorSection[]>(() => [
        {
            id: 'summary',
            title: 'Professional Summary',
            content: initialData?.summary || '',
            placeholder: 'Write a compelling professional summary...'
        },
        {
            id: 'experience',
            title: 'Work Experience',
            content: initialData?.experience?.map(exp =>
                `${exp.title} at ${exp.company}\n${exp.startDate} - ${exp.endDate}\n${exp.description}`
            ).join('\n\n') || '',
            placeholder: 'Format: Job Title at Company\nStart Date - End Date\nDescription'
        },
        {
            id: 'education',
            title: 'Education',
            content: initialData?.education?.map(edu =>
                `${edu.degree} in ${edu.field}\n${edu.institution}\n${edu.graduationYear}`
            ).join('\n\n') || '',
            placeholder: 'Format: Degree in Field\nInstitution\nGraduation Year'
        },
        {
            id: 'skills',
            title: 'Skills',
            content: initialData?.skills?.map(skill => skill.name).join(', ') || '',
            placeholder: 'Enter your skills, separated by commas...'
        }
    ]);

    const [activeSection, setActiveSection] = useState<string>('summary');
    const [jobDescription, setJobDescription] = useState('');
    const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
    const [validationIssues, setValidationIssues] = useState<string[]>([]);
    const [isImproving, setIsImproving] = useState(false);
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<{ score: number; suggestions: string[] } | null>(null);
    const [showJobPanel, setShowJobPanel] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Memoized job requirements
    const [jobRequirements, setJobRequirements] = useState<{ requiredSkills: string[]; preferredSkills: string[] } | null>(null);

    // Debounced autosave
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSave();
        }, AUTOSAVE_DELAY);

        return () => clearTimeout(timer);
    }, [sections]);

    // Validate content when it changes
    useEffect(() => {
        if (!activeSection) return;

        const currentContent = sections.find(s => s.id === activeSection)?.content || '';
        const { issues } = validateContentAgainstRules(activeSection, currentContent);
        setValidationIssues(issues);
    }, [activeSection, sections]);

    // Memoized handlers
    const handleImproveATS = useCallback(async () => {
        if (!activeSection) return;
        setIsImproving(true);

        try {
            const currentContent = sections.find(s => s.id === activeSection)?.content || '';
            const { content: improvedContent, score } = await generateImprovedContent(
                activeSection,
                currentContent,
                jobDescription
            );

            handleContentChange(activeSection, improvedContent);
            setAtsScore(score);
            toast.success('Content improved successfully');
        } catch (error) {
            console.error('Error improving content:', error);
            toast.error('Failed to improve content');
        } finally {
            setIsImproving(false);
        }
    }, [activeSection, sections, jobDescription]);

    const handleAnalyze = useCallback(async () => {
        if (!activeSection) return;
        setIsAiAnalyzing(true);

        try {
            const currentContent = sections.find(s => s.id === activeSection)?.content || '';
            const analysis = await analyzeResumeContent(
                activeSection,
                currentContent,
                jobDescription
            );

            setAtsScore(analysis.score);
            setAiSuggestions({
                score: analysis.score.overall,
                suggestions: analysis.analysis.weaknesses
            });
            toast.success('Analysis complete');
        } catch (error) {
            console.error('Error analyzing content:', error);
            toast.error('Analysis failed');
        } finally {
            setIsAiAnalyzing(false);
        }
    }, [activeSection, sections, jobDescription]);

    const handleContentChange = useCallback((sectionId: string, newContent: string) => {
        setSections(prev =>
            prev.map(section =>
                section.id === sectionId
                    ? { ...section, content: newContent }
                    : section
            )
        );
    }, []);

    const handleSave = useCallback(async () => {
        if (!onSave || isSaving) return;
        setIsSaving(true);

        try {
            await onSave(formatResumeData());
            toast.success('Changes saved successfully');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    }, [sections, onSave, isSaving]);

    // Memoized computations
    const activeSectionData = useMemo(() =>
        sections.find(s => s.id === activeSection),
        [sections, activeSection]
    );

    const jobKeywords = useMemo(() =>
        jobRequirements
            ? [...jobRequirements.requiredSkills, ...jobRequirements.preferredSkills]
            : [],
        [jobRequirements]
    );

    // Helper function to format resume data
    function formatResumeData(): ResumeData {
        const findSection = (id: string) => sections.find(s => s.id === id)?.content || '';

        return {
            id: initialData?.id || '',
            name: initialData?.name || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            location: initialData?.location || '',
            linkedin: initialData?.linkedin || '',
            github: initialData?.github || '',
            website: initialData?.website || '',
            objective: initialData?.objective || '',
            summary: findSection('summary'),
            experience: findSection('experience')
                .split('\n\n')
                .filter(Boolean)
                .map((exp, index) => {
                    const [title, dates, description] = exp.split('\n');
                    const [startDate, endDate] = dates.split(' - ');
                    return {
                        id: `${index + 1}`,
                        title: title.split(' at ')[0],
                        company: title.split(' at ')[1],
                        startDate,
                        endDate,
                        description,
                        logo: null
                    };
                }),
            education: findSection('education')
                .split('\n\n')
                .filter(Boolean)
                .map((edu, index) => {
                    const [degree, institution, graduationYear] = edu.split('\n');
                    return {
                        id: `${index + 1}`,
                        degree: degree.split(' in ')[0],
                        field: degree.split(' in ')[1],
                        institution,
                        graduationYear,
                        logo: null
                    };
                }),
            skills: findSection('skills').split(', ').filter(Boolean).map((skill, index) => ({ id: `${index + 1}`, name: skill }))
        };
    }

    return (
        <ErrorBoundary>
            <div className="h-full flex">
                {/* Left Sidebar - Sections Navigation */}
                <div className="w-64 border-r p-4 space-y-4">
                    <div className="space-y-2">
                        {sections.map(section => (
                            <Button
                                key={section.id}
                                variant={activeSection === section.id ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setActiveSection(section.id)}
                            >
                                {section.title}
                            </Button>
                        ))}
                    </div>

                    {/* ATS Score Card */}
                    {atsScore && (
                        <ATSScoring
                            score={atsScore}
                            onRequestImprovement={handleImproveATS}
                            isAnalyzing={isImproving}
                        />
                    )}
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex">
                    <div className="flex-1 p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">
                                {activeSectionData?.title}
                            </h2>
                            <div className="space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowJobPanel(!showJobPanel)}
                                >
                                    {showJobPanel ? 'Hide Job Analysis' : 'Show Job Analysis'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleAnalyze}
                                    disabled={isAiAnalyzing}
                                >
                                    {isAiAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>

                        {/* Validation Issues */}
                        {validationIssues.length > 0 && (
                            <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900">
                                <CardContent className="p-4">
                                    <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                                        Content Guidelines
                                    </h4>
                                    <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                                        {validationIssues.map((issue, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Main Content Area */}
                        <div className="flex gap-4 h-[calc(100vh-200px)]">
                            {/* Editor Column */}
                            <div className="flex-1 space-y-4">
                                {/* Job Description Input */}
                                <Card className="mb-4">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Job Description (Optional)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <TextEditor
                                            value={jobDescription}
                                            onChange={setJobDescription}
                                            placeholder="Paste the job description here for better AI suggestions..."
                                            minHeight="100px"
                                            section="jobDescription"
                                        />
                                    </CardContent>
                                </Card>

                                {/* Section Editor */}
                                <ErrorBoundary>
                                    <Card className="flex-1">
                                        <CardContent className="p-4 h-full">
                                            {activeSectionData && (
                                                <TextEditor
                                                    value={activeSectionData.content}
                                                    onChange={(content) => handleContentChange(activeSectionData.id, content)}
                                                    placeholder={activeSectionData.placeholder}
                                                    minHeight={activeSectionData.id === 'skills' ? '200px' : '400px'}
                                                    section={activeSectionData.id}
                                                    jobKeywords={jobKeywords}
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                </ErrorBoundary>
                            </div>
                        </div>
                    </div>

                    {showJobPanel && (
                        <div className="w-80 space-y-4">
                            {/* Job Requirements Panel */}
                            <JobParser
                                jobDescription={jobDescription}
                                onParseComplete={setJobRequirements}
                            />

                            {/* AI Suggestions */}
                            {aiSuggestions && (
                                <Card className="border-primary">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center justify-between">
                                            AI Suggestions
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                Score: {aiSuggestions.score}%
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        <ul className="list-disc list-inside space-y-2">
                                            {aiSuggestions.suggestions.map((suggestion, index) => (
                                                <li key={index}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}

