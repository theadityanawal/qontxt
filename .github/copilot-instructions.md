# qontxt AI Integration Guidelines

## Core Principles

### Resume Analysis Flow
1. **Job Description Processing**
   - Break down JD into structured components:
     ```typescript
     interface JobAnalysis {
       keyRequirements: string[];
       technicalSkills: string[];
       softSkills: string[];
       roleResponsibilities: string[];
       experienceLevels: {
         minimum: number;
         preferred: number;
       };
     }
     ```

2. **Resume Content Optimization**
   - Follow strict content hierarchy:
     ```typescript
     interface ContentOptimization {
       sections: {
         workExperience: OptimizationRules;
         projects: OptimizationRules;
         skills: OptimizationRules;
         education: OptimizationRules;
       };
     }

     interface OptimizationRules {
       relevanceThreshold: number;
       keywordDensity: number;
       contextualWeight: number;
     }
     ```

## Implementation Guidelines

### 1. OpenAI Integration
```typescript
import { Configuration, OpenAIApi } from 'openai';

// CORRECT ✅
const analyzeJobDescription = async (
  description: string
): Promise<JobAnalysis> => {
  const prompt = `
    Analyze the following job description and extract key components:
    ${description}

    Provide a structured analysis with:
    - Key requirements (must-haves)
    - Technical skills required
    - Soft skills mentioned
    - Core responsibilities
    - Experience requirements
  `;

  return processAIResponse(await generateCompletion(prompt));
};

// WRONG ❌
const badAnalysis = async (text: string) => {
  // Don't do raw completions without structure
  const result = await openai.createCompletion({
    prompt: `Analyze this: ${text}`,
    max_tokens: 1000
  });
}
```

### 2. Resume Content Generation
```typescript
// CORRECT ✅
interface ResumeGenerationConfig {
  styleGuide: {
    toneOfVoice: 'professional' | 'casual' | 'technical';
    verbStyle: 'action' | 'descriptive';
    formatPreference: 'bullet' | 'paragraph';
  };
  optimizationRules: {
    keywordMatchThreshold: number;
    contentLengthLimits: {
      bulletPoint: number;
      paragraph: number;
    };
  };
}

// WRONG ❌
const generateBadResume = async (baseContent: string) => {
  // Don't generate without context and rules
  return await openai.createCompletion({
    prompt: `Make this better: ${baseContent}`
  });
};
```

### 3. Content Validation Rules

```typescript
const VALIDATION_RULES = {
  bulletPoints: {
    minLength: 30,
    maxLength: 100,
    mustStartWithAction: true,
    forbiddenPhrases: [
      'responsible for',
      'worked on',
      'helped with'
    ]
  },
  skillMatching: {
    minimumConfidence: 0.7,
    contextRelevance: 0.5,
    maximumSkillsPerSection: 8
  }
};
```

## Response Structure Guidelines

### 1. Work Experience Optimization
```typescript
interface ExperienceOptimization {
  original: string;
  optimized: string;
  matchedKeywords: string[];
  relevanceScore: number;
  suggestedImprovements: string[];
}

const EXPERIENCE_PROMPT_TEMPLATE = `
Context: Tailoring work experience for [ROLE] position
Original Experience: [EXPERIENCE]
Job Requirements: [REQUIREMENTS]

Instructions:
1. Maintain factual accuracy
2. Emphasize relevant achievements
3. Incorporate key technical terms
4. Use quantifiable metrics
5. Follow STAR format where applicable

Generate an optimized version that:
- Highlights relevant skills
- Uses industry-specific terminology
- Focuses on measurable impact
`;
```

### 2. Project Descriptions
```typescript
interface ProjectOptimization {
  title: string;
  description: string;
  highlightedTechnologies: string[];
  relevanceToRole: number;
  suggestedFocus: string[];
}
```

## Error Handling & Edge Cases

```typescript
const ERROR_TYPES = {
  CONTENT_GENERATION: 'content_generation_error',
  VALIDATION_FAILED: 'validation_failed',
  RELEVANCE_LOW: 'relevance_score_low',
  TOKEN_LIMIT: 'token_limit_exceeded'
} as const;

interface AIGenerationError {
  type: keyof typeof ERROR_TYPES;
  message: string;
  suggestions: string[];
  fallbackContent?: string;
}
```

## Best Practices

### 1. Prompt Engineering
- Always include context about the target role
- Specify output format requirements
- Include examples of desired style
- Set clear constraints and boundaries

### 2. Content Validation
- Check for factual consistency with base resume
- Validate technical terminology usage
- Ensure quantifiable metrics are preserved
- Verify date and timeline consistency

### 3. Performance Optimization
- Cache common job description analyses
- Implement retry logic with exponential backoff
- Use streaming responses for long-form content
- Batch similar optimization requests

## Security Guidelines

1. **Data Sanitization**
   - Strip sensitive information before AI processing
   - Validate and sanitize AI outputs
   - Implement content filtering for inappropriate content

2. **Rate Limiting**
   - Implement per-user rate limits
   - Add cooldown periods between generations
   - Monitor token usage patterns

## UI Component Integration

### shadcn/ui Component Guidelines

```typescript
// CORRECT ✅ - Structured content for Card components
interface ResumeSection {
  title: string;
  content: {
    type: 'bullet' | 'paragraph';
    items: string[];
    metadata?: {
      relevance: number;
      keywords: string[];
    };
  };
}

// Example of AI-friendly component structure
const ExperienceCard: React.FC<{ experience: ResumeSection }> = ({ experience }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {experience.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {experience.content.type === 'bullet' ? (
          <ul className="space-y-2">
            {experience.content.items.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            {experience.content.items.join(' ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// WRONG ❌ - Directly injecting AI content without structure
const BadExperienceCard = ({ aiContent }) => (
  <Card>
    <CardContent>
      <div dangerouslySetInnerHTML={{ __html: aiContent }} />
    </CardContent>
  </Card>
);
```

### Content Rendering Rules

1. **Typography Handling**
```typescript
const AI_CONTENT_STYLES = {
  headings: {
    h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight'
  },
  content: {
    paragraph: 'leading-7 [&:not(:first-child)]:mt-6',
    list: 'my-6 ml-6 list-disc [&>li]:mt-2'
  }
};

// CORRECT ✅ - Structured content renderer
const AIContentRenderer: React.FC<{
  content: AIGeneratedContent,
  variant: keyof typeof CONTENT_VARIANTS
}> = ({ content, variant }) => {
  return (
    <div className="space-y-4">
      {content.sections.map((section, idx) => (
        <ContentSection
          key={idx}
          section={section}
          variant={variant}
          className={AI_CONTENT_STYLES[variant]}
        />
      ))}
    </div>
  );
};
```

2. **Interactive Components**
```typescript
const SkillsHoverCard: React.FC<{ skill: AIGeneratedSkill }> = ({ skill }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <Button variant="link">{skill.name}</Button>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">{skill.name}</h4>
        <Progress value={skill.relevance * 100} />
        <p className="text-sm text-muted-foreground">
          {skill.context}
        </p>
      </div>
    </HoverCardContent>
  </HoverCard>
);
```

3. **Alert States**
```typescript
const AI_ALERT_VARIANTS = {
  suggestion: {
    title: 'AI Suggestion',
    variant: 'default' as const,
    icon: Lightbulb
  },
  warning: {
    title: 'Content Warning',
    variant: 'warning' as const,
    icon: AlertTriangle
  },
  error: {
    title: 'Generation Error',
    variant: 'destructive' as const,
    icon: XCircle
  }
} as const;

const AIAlert: React.FC<{
  type: keyof typeof AI_ALERT_VARIANTS;
  message: string;
}> = ({ type, message }) => {
  const config = AI_ALERT_VARIANTS[type];
  return (
    <Alert variant={config.variant}>
      <config.icon className="h-4 w-4" />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
```

## Caching & Performance

### Response Caching Strategy
```typescript
interface CacheConfig {
  ttl: number;
  maxEntries: number;
  invalidationRules: {
    onBaseUpdate: boolean;
    onJobUpdate: boolean;
    onFormatChange: boolean;
  };
}

const CACHE_RULES: Record<CacheKey, CacheConfig> = {
  jobAnalysis: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 100,
    invalidationRules: {
      onBaseUpdate: false,
      onJobUpdate: true,
      onFormatChange: false
    }
  },
  resumeGeneration: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxEntries: 50,
    invalidationRules: {
      onBaseUpdate: true,
      onJobUpdate: true,
      onFormatChange: true
    }
  }
};
```

### Rate Limiting
```typescript
const RATE_LIMITS = {
  free: {
    generations: 5,
    interval: 'day',
    concurrency: 1
  },
  pro: {
    generations: 50,
    interval: 'day',
    concurrency: 3
  }
} as const;

const rateLimit = (
  userId: string,
  tier: keyof typeof RATE_LIMITS
): Promise<boolean> => {
  // Implementation
};
```

## Scheduled Jobs & Background Processing

### Job Types & Scheduling
```typescript
// If you're copy-pasting this, we need to talk about your life choices
interface BackgroundJob {
  type: 'cache-cleanup' | 'resume-refresh' | 'usage-metrics';
  priority: 1 | 2 | 3; // 1 = "my CEO is waiting", 3 = "maybe next year"
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'when-hell-freezes-over';
    preferredTimeWindow?: TimeWindow;
  };
}

// CORRECT ✅ - Structured job definition
const MAINTENANCE_JOBS = {
  cacheCleanup: {
    schedule: 'daily',
    handler: async () => {
      const expiredEntries = await findExpiredCacheEntries();
      if (expiredEntries.length === 0) {
        console.log('Cache is clean. Did someone else do my job? 🤔');
        return;
      }
      await Promise.all(expiredEntries.map(removeFromCache));
    }
  }
} as const;

// WRONG ❌ - The "I'll fix it later" special
const messyCleanup = async () => {
  // Delete everything and hope for the best
  await cache.clear();
  // TODO: Add actual logic (said 6 months ago)
};
```

### Background Processing Rules
```typescript
const PROCESSING_RULES = {
  retryStrategy: {
    maxAttempts: 3,
    backoff: 'exponential', // Not "whenever I feel like it"
    initialDelay: 1000
  },
  priorityQueues: {
    high: { // CEO's resume
      timeout: 30000,
      concurrency: 5
    },
    low: { // That intern who keeps regenerating their resume
      timeout: 60000,
      concurrency: 2
    }
  }
};
```

## Public vs Internal Functions

### Public API Surface (Things We Let Users Touch)
```typescript
// The "Here's what users can't break too badly" API
export const publicApi = {
  generateResume: async (
    baseResume: Resume,
    jobDescription: string
  ): Promise<AIGenerationResult> => {
    validateInputs(baseResume, jobDescription); // Trust no one
    return await internalApi.safelyGenerateResume(baseResume, jobDescription);
  },

  getGenerationStatus: async (
    generationId: string
  ): Promise<GenerationStatus> => {
    // Yes, checking the status every 100ms won't make it faster
    return await internalApi.getStatus(generationId);
  }
};

// WRONG ❌ - The "I trust users" approach
export const dangerouslyExposeEverything = {
  rawAIAccess: openai, // What could go wrong?
  allTheSecrets: process.env, // Share ALL the things!
  database: entireDatabase // Full access, because YOLO
};
```

### Internal Functions (The "Adults Only" Zone)
```typescript
// Where the real magic happens (and stays hidden)
const internalApi = {
  safelyGenerateResume: async (
    baseResume: Resume,
    jobDescription: string
  ): Promise<AIGenerationResult> => {
    try {
      const analysis = await analyzeJobDescription(jobDescription);
      const optimized = await optimizeResume(baseResume, analysis);
      return sanitizeOutput(optimized); // Remove those hallucinated PhDs
    } catch (error) {
      // Not just console.log(error) and pray
      return handleGenerationError(error);
    }
  },

  // The function graveyard - where bad generations go to die
  cleanupFailedGenerations: async () => {
    const failed = await findFailedGenerations();
    await Promise.all(failed.map(sendToTheVoid));
  }
};
```

## Error Handling (Because Things Will Break)

### Error Types & Hierarchy
```typescript
// The "What Could Possibly Go Wrong?" Catalog
type AIErrorCode =
  | 'HALLUCINATION_OVERDOSE' // AI got too creative
  | 'SKILL_INFLATION' // Junior dev → Senior Architect
  | 'PROMPT_AMNESIA' // AI forgot what we asked
  | 'TOKEN_BANKRUPTCY' // Out of tokens, send help
  | 'REALITY_DISTORTION'; // AI thinks it's 2050

interface AIError extends Error {
  code: AIErrorCode;
  severity: 'meh' | 'yikes' | 'defcon-1';
  context: {
    input?: unknown;
    attempt: number;
    lastWords?: string;
  };
}

// CORRECT ✅ - Proper error handling
const handleAIError = async (error: AIError): Promise<ErrorResponse> => {
  await logError(error); // For future archaeologists

  switch (error.code) {
    case 'HALLUCINATION_OVERDOSE':
      return {
        userMessage: "AI got a bit too imaginative. Let's try again.",
        recovery: retryWithConstraints
      };
    case 'SKILL_INFLATION':
      return {
        userMessage: "Let's keep it real.",
        recovery: regenerateWithFactCheck
      };
    default:
      return {
        userMessage: "Even AI needs coffee sometimes.",
        recovery: defaultRecovery
      };
  }
};

// WRONG ❌ - The "This Is Fine" Approach
const ignoreErrors = async (error: any) => {
  console.log('Oops'); // Premium debugging
  return null; // Problem solved!
};
```

### Recovery Strategies
```typescript
const RECOVERY_STRATEGIES = {
  retry: {
    maxAttempts: 3,
    backoffMs: [1000, 3000, 5000], // Not [1, 2, "maybe"]
    fallbackOptions: ['cached', 'simplified', 'give-up']
  },

  degradedService: {
    // When all else fails, blame it on Mercury retrograde
    enableFallbacks: true,
    notifyUser: true,
    prayToTechGods: true
  }
};
```

### Error Monitoring & Aggregation
```typescript
interface ErrorMetrics {
  totalFailures: number;
  uniqueErrors: Map<AIErrorCode, number>;
  recoveryRate: number;
  avgRecoveryTime: number;
  userImpact: {
    affected: number;
    recovered: number;
    angry: number; // Key metric
  };
}

// Because what you don't monitor will haunt you
const monitorErrors = async (
  error: AIError,
  context: ErrorContext
): Promise<void> => {
  await Promise.all([
    updateErrorMetrics(error),
    notifyIfCritical(error),
    updateStatusPage(error),
    orderCoffeeIfNeeded(error)
  ]);
};
```

## Testing & Quality Assurance

```typescript
interface AITestCase {
  input: {
    baseResume: Resume;
    targetJob: JobDescription;
    optimizationRules: OptimizationRules;
  };
  expectedOutput: {
    relevanceScore: number;
    keywordMatches: number;
    contentLength: ContentLengthRules;
  };
}
```

Remember: The AI is your colleague who had too much coffee - enthusiastic but needs clear boundaries! 🤖☕
