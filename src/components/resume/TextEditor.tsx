import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyzeResumeContent } from '@/lib/services/ai/ai-utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { toast } from 'sonner';
import { DEFAULT_MODELS } from '@/lib/ai/types';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  section: string;
  jobKeywords?: string[];
  modelPreference?: string;
  onModelChange?: (modelId: string) => void;
}

interface InlineSuggestion {
  start: number;
  end: number;
  text: string;
  type: 'improvement' | 'keyword' | 'weak-phrase' | 'error';
  suggestion?: string;
}

const WEAK_PHRASES = [
  'responsible for',
  'worked on',
  'helped with',
  'assisted in',
  'was involved in',
  'participated in'
];

const ANALYSIS_DEBOUNCE = 1000; // 1 second
const EDIT_DEBOUNCE = 300; // 300ms for performance

export function TextEditor({
  value,
  onChange,
  placeholder,
  minHeight = '300px',
  section,
  jobKeywords = [],
  modelPreference,
  onModelChange
}: TextEditorProps) {
  const [suggestions, setSuggestions] = useState<InlineSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState(modelPreference || 'gemini-2-flash');
  const [isTyping, setIsTyping] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Enhanced highlighted keywords with memoized regex patterns
  const highlightedKeywords = useMemo(() => {
    if (!value || !jobKeywords.length) return new Set<string>();

    const patterns = jobKeywords.map(keyword =>
      new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    );

    return new Set(
      jobKeywords.filter((_, i) => patterns[i].test(value))
    );
  }, [value, jobKeywords]);

  // Track cursor position
  const handleSelect = useCallback(() => {
    if (editorRef.current) {
      setCursorPosition(editorRef.current.selectionStart);
    }
  }, []);

  // Debounced content change handler
  const debouncedChange = useCallback(
    debounce((newValue: string) => {
      onChange(newValue);
      setIsTyping(false);
    }, EDIT_DEBOUNCE),
    [onChange]
  );

  // Handle content changes with debouncing
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsTyping(true);
    debouncedChange(e.target.value);
  }, [debouncedChange]);

  // Enhanced analysis function with error tracking
  const performAnalysis = useCallback(async (content: string) => {
    if (content.length < 30) return;

    try {
      setIsAnalyzing(true);
      const result = await analyzeResumeContent(section, content, undefined, selectedModel);

      // Transform analysis results into inline suggestions
      const newSuggestions: InlineSuggestion[] = [];

      // Add keyword matches
      result.keywords.found.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        let match;
        while ((match = regex.exec(content)) !== null) {
          newSuggestions.push({
            start: match.index,
            end: match.index + keyword.length,
            text: keyword,
            type: 'keyword'
          });
        }
      });

      // Add improvement suggestions for weak phrases
      WEAK_PHRASES.forEach(phrase => {
        const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
        let match;
        while ((match = regex.exec(content)) !== null) {
          newSuggestions.push({
            start: match.index,
            end: match.index + phrase.length,
            text: phrase,
            type: 'weak-phrase',
            suggestion: 'Use a stronger action verb'
          });
        }
      });

      setSuggestions(newSuggestions);
    } catch (error) {
      errorTracker.trackError(
        error instanceof Error ? error : new Error('Content analysis failed'),
        'medium',
        {
          component: 'TextEditor',
          section,
          metadata: { contentLength: content.length }
        }
      );
      toast.error('Failed to analyze content');

      // Add error suggestion
      setSuggestions([{
        start: 0,
        end: 0,
        text: 'Analysis failed',
        type: 'error',
        suggestion: 'Try analyzing again or contact support if the issue persists'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [section, selectedModel, toast]);

  // Debounced analysis with cleanup
  const debouncedAnalysis = useMemo(
    () => debounce(performAnalysis, ANALYSIS_DEBOUNCE),
    [performAnalysis]
  );

  // Trigger analysis when content changes
  useEffect(() => {
    if (!isTyping) {
      debouncedAnalysis(value);
    }
    return () => debouncedAnalysis.cancel();
  }, [value, debouncedAnalysis, isTyping]);

  // Handle model change
  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    onModelChange?.(modelId);
    // Re-run analysis with new model
    debouncedAnalysis(value);
  }, [value, onModelChange, debouncedAnalysis]);

  // Calculate suggestion markers positions
  const renderSuggestionMarkers = useCallback(() => {
    if (!editorRef.current) return null;

    return suggestions.map((suggestion, index) => {
      if (suggestion.type === 'error') {
        return (
          <div key="error" className="absolute top-2 right-2 text-destructive text-sm">
            ⚠️ Analysis Error
          </div>
        );
      }

      const textBeforeSuggestion = value.substring(0, suggestion.start);
      const lines = textBeforeSuggestion.split('\n');
      const lineNumber = lines.length - 1;
      const lastLineLength = lines[lines.length - 1].length;

      // Calculate position based on text metrics
      const lineHeight = 20;
      const charWidth = 8;
      const top = lineNumber * lineHeight;
      const left = lastLineLength * charWidth;

      return (
        <HoverCard key={index}>
          <HoverCardTrigger asChild>
            <div
              className={`absolute w-2 h-2 rounded-full cursor-help ${
                suggestion.type === 'keyword'
                  ? 'bg-green-500'
                  : suggestion.type === 'weak-phrase'
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              style={{
                top: `${top}px`,
                left: `${left}px`,
              }}
            />
          </HoverCardTrigger>
          <HoverCardContent side="right" className="w-64">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {suggestion.type === 'keyword'
                  ? 'Matched Keyword'
                  : suggestion.type === 'weak-phrase'
                  ? 'Weak Phrase Detected'
                  : 'Suggestion'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {suggestion.suggestion || `"${suggestion.text}" is a good match for the job requirements`}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    });
  }, [suggestions, value]);

  // Handle paste to clean up formatting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <div className="relative space-y-2">
      <div className="flex items-center justify-between">
        <Select
          value={selectedModel}
          onValueChange={handleModelChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEFAULT_MODELS).map(([id, config]) => (
              <SelectItem key={id} value={id}>
                {config.provider === 'gemini' ? '⚡' : config.provider === 'openai' ? '🤖' : '🧠'} {config.modelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => debouncedAnalysis(value)}
          disabled={isAnalyzing || value.length < 30}
        >
          {isAnalyzing ? '🔍 Analyzing...' : '🔍 Check'}
        </Button>
      </div>

      <div className="relative">
        <textarea
          ref={editorRef}
          value={value}
          onChange={handleContentChange}
          onSelect={handleSelect}
          onPaste={handlePaste}
          className="w-full bg-background resize-vertical rounded-md border p-4 focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ minHeight }}
          placeholder={placeholder}
        />
        <div className="absolute top-0 left-0 pointer-events-none">
          {renderSuggestionMarkers()}
        </div>
      </div>

      {/* Keyword matches */}
      {highlightedKeywords.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(highlightedKeywords).map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              ✓ {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

