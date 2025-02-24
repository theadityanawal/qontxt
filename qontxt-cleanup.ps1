# qontxt Project Cleanup Script
# This script reorganizes the project structure and removes unnecessary files

# Create backup before making changes
$backupFolder = "qontxt-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating backup in $backupFolder..." -ForegroundColor Cyan
Copy-Item -Path "./" -Destination "../$backupFolder" -Recurse -Force

# Define core directories to create/ensure
$directories = @(
    "src/app/(auth)",
    "src/app/(dashboard)",
    "src/app/api/auth",
    "src/app/api/resume",
    "src/app/api/ai",
    "src/app/api/settings",
    "src/components/auth",
    "src/components/dashboard",
    "src/components/resume",
    "src/components/ai",
    "src/components/ui",
    "src/lib/services/auth",
    "src/lib/services/ai",
    "src/lib/services/resume",
    "src/lib/services/settings",
    "src/lib/utils",
    "src/types"
)

# Create directories
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        Write-Host "Creating directory: $dir" -ForegroundColor Green
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Define files to remove (duplicate/incomplete/inconsistent)
$filesToRemove = @(
    "src/lib/resume.ts",
    "src/lib/resume/index.ts",
    "src/lib/resume/resume.service.ts",
    "src/lib/resumes.ts",
    "src/lib/ai/gemini.adapter.ts",
    "src/lib/ai/rate-limit.ts",
    "src/lib/ai/providers/deepseek.provider.ts",
    "src/types/resume.ts",
    "src/lib/sanitize.ts",
    "src/components/AuthButton.tsx"
)

# Remove unnecessary files
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "Removing file: $file" -ForegroundColor Yellow
        Remove-Item -Path $file -Force
    }
}

# File movements (organized by feature)
$fileMovements = @(
    # Auth related files
    @{Source = "src/lib/auth.tsx"; Destination = "src/lib/services/auth/auth.service.tsx"},
    @{Source = "src/lib/firebase.ts"; Destination = "src/lib/services/auth/firebase.client.ts"},
    @{Source = "src/lib/firebase-admin.ts"; Destination = "src/lib/services/auth/firebase.admin.ts"},

    # AI service files
    @{Source = "src/lib/ai/ai.service.ts"; Destination = "src/lib/services/ai/ai.service.ts"},
    @{Source = "src/lib/ai/provider.factory.ts"; Destination = "src/lib/services/ai/provider.factory.ts"},
    @{Source = "src/lib/ai/providers/gemini.provider.ts"; Destination = "src/lib/services/ai/providers/gemini.provider.ts"},
    @{Source = "src/lib/ai/providers/openai.provider.ts"; Destination = "src/lib/services/ai/providers/openai.provider.ts"},
    @{Source = "src/lib/ai/types.ts"; Destination = "src/lib/services/ai/types.ts"},
    @{Source = "src/lib/ai-utils.ts"; Destination = "src/lib/services/ai/ai-utils.ts"},

    # Resume service files
    # We'll create a new clean implementation

    # Settings service
    @{Source = "src/lib/settings.ts"; Destination = "src/lib/services/settings/settings.service.ts"},

    # Utility services
    @{Source = "src/lib/metrics.ts"; Destination = "src/lib/services/metrics.service.ts"},
    @{Source = "src/lib/rate-limit.ts"; Destination = "src/lib/services/rate-limit.service.ts"},
    @{Source = "src/lib/redis.ts"; Destination = "src/lib/services/redis.service.ts"},
    @{Source = "src/lib/utils.ts"; Destination = "src/lib/utils/index.ts"},

    # Types
    @{Source = "src/types/api.types.ts"; Destination = "src/types/api.ts"},
    @{Source = "src/types/resume.types.ts"; Destination = "src/types/resume.ts"},
    @{Source = "src/types/settings.ts"; Destination = "src/types/settings.ts"},

    # UI Components
    @{Source = "src/components/AuthButton.tsx"; Destination = "src/components/auth/AuthButton.tsx"},
    @{Source = "src/components/DashboardSidebar.tsx"; Destination = "src/components/dashboard/Sidebar.tsx"},
    @{Source = "src/components/ErrorBoundary.tsx"; Destination = "src/components/ErrorBoundary.tsx"},
    @{Source = "src/components/SettingsPanel.tsx"; Destination = "src/components/settings/SettingsPanel.tsx"},

    # Resume Components
    @{Source = "src/components/ResumeEditor.tsx"; Destination = "src/components/resume/ResumeEditor.tsx"},
    @{Source = "src/components/TextEditor.tsx"; Destination = "src/components/resume/TextEditor.tsx"},

    # AI Components
    @{Source = "src/components/ai/ATSScoring.tsx"; Destination = "src/components/ai/ATSScoring.tsx"},
    @{Source = "src/components/ai/JobParser.tsx"; Destination = "src/components/ai/JobParser.tsx"},
    @{Source = "src/components/ai/ResumeAnalyzer.tsx"; Destination = "src/components/ai/ResumeAnalyzer.tsx"},
    @{Source = "src/components/ai/index.ts"; Destination = "src/components/ai/index.ts"},

    # API Routes
    @{Source = "src/app/api/ai/analyze/route.ts"; Destination = "src/app/api/ai/analyze/route.ts"},
    @{Source = "src/app/api/ai/parse-job/route.ts"; Destination = "src/app/api/ai/parse-job/route.ts"},
    @{Source = "src/app/api/auth/session/route.ts"; Destination = "src/app/api/auth/session/route.ts"},
    @{Source = "src/app/api/settings/route.ts"; Destination = "src/app/api/settings/route.ts"},

    # Pages
    @{Source = "src/app/auth/page.tsx"; Destination = "src/app/(auth)/page.tsx"},
    @{Source = "src/app/dashboard/layout.tsx"; Destination = "src/app/(dashboard)/layout.tsx"},
    @{Source = "src/app/dashboard/page.tsx"; Destination = "src/app/(dashboard)/page.tsx"},
    @{Source = "src/app/dashboard/resumes/page.tsx"; Destination = "src/app/(dashboard)/resumes/page.tsx"},
    @{Source = "src/app/dashboard/resumes/[id]/page.tsx"; Destination = "src/app/(dashboard)/resumes/[id]/page.tsx"},
    @{Source = "src/app/dashboard/resumes/new/page.tsx"; Destination = "src/app/(dashboard)/resumes/new/page.tsx"},
    @{Source = "src/app/dashboard/settings/page.tsx"; Destination = "src/app/(dashboard)/settings/page.tsx"}
)

# Move files to their new locations
foreach ($move in $fileMovements) {
    if (Test-Path $move.Source) {
        $destDir = Split-Path -Path $move.Destination -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        Write-Host "Moving: $($move.Source) -> $($move.Destination)" -ForegroundColor Blue
        Move-Item -Path $move.Source -Destination $move.Destination -Force
    } else {
        Write-Host "Warning: Source file not found: $($move.Source)" -ForegroundColor Yellow
    }
}

# Create a clean resume service implementation
$resumeServicePath = "src/lib/services/resume/resume.service.ts"
Write-Host "Creating a clean resume service implementation at $resumeServicePath" -ForegroundColor Green

$resumeServiceContent = @'
import { ResumeData, ResumeMetadata } from '@/types/resume';
import { db } from '@/lib/services/auth/firebase.client';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { AIService } from '@/lib/services/ai/ai.service';

class ResumeService {
  private static instance: ResumeService;
  private aiService: AIService;

  private constructor() {
    this.aiService = AIService.getInstance();
  }

  public static getInstance(): ResumeService {
    if (!ResumeService.instance) {
      ResumeService.instance = new ResumeService();
    }
    return ResumeService.instance;
  }

  /**
   * Create a new resume for a user
   */
  public async createResume(userId: string, title: string): Promise<string> {
    try {
      const resumeRef = doc(collection(db, 'resumes'));

      const newResume = {
        id: resumeRef.id,
        userId,
        title: title || 'Untitled Resume',
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        content: {
          summary: '',
          experience: [],
          education: [],
          skills: []
        }
      };

      await setDoc(resumeRef, newResume);
      return resumeRef.id;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw new Error('Failed to create resume');
    }
  }

  /**
   * Get a resume by ID
   */
  public async getResumeById(resumeId: string): Promise<ResumeData | null> {
    try {
      const docRef = doc(db, 'resumes', resumeId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data() as ResumeData;
    } catch (error) {
      console.error('Error getting resume:', error);
      throw new Error('Failed to get resume');
    }
  }

  /**
   * Get all resumes for a user
   */
  public async getUserResumes(userId: string): Promise<ResumeMetadata[]> {
    try {
      const resumesQuery = query(
        collection(db, 'resumes'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(resumesQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          lastModified: data.updatedAt?.toDate?.() || new Date(),
          score: data.atsScore,
          status: data.status
        } as ResumeMetadata;
      });
    } catch (error) {
      console.error('Error getting user resumes:', error);
      throw new Error('Failed to get user resumes');
    }
  }

  /**
   * Update a resume
   */
  public async updateResume(
    resumeId: string,
    data: Partial<ResumeData>,
    userId: string
  ): Promise<void> {
    try {
      // Verify ownership
      const docRef = doc(db, 'resumes', resumeId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Resume not found');
      }

      const resumeData = docSnap.data();
      if (resumeData.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Update resume
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating resume:', error);
      throw new Error('Failed to update resume');
    }
  }

  /**
   * Delete a resume
   */
  public async deleteResume(resumeId: string, userId: string): Promise<void> {
    try {
      // Verify ownership
      const docRef = doc(db, 'resumes', resumeId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Resume not found');
      }

      const resumeData = docSnap.data();
      if (resumeData.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Delete resume
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error('Failed to delete resume');
    }
  }

  /**
   * Analyze a resume for ATS compatibility
   */
  public async analyzeResume(resumeId: string, userId: string, jobDescription?: string): Promise<any> {
    try {
      const resume = await this.getResumeById(resumeId);

      if (!resume) {
        throw new Error('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Call AI service to analyze resume
      // This is a placeholder - implementation will depend on AI service
      const analysis = await this.aiService.analyzeResume(resume, jobDescription);

      // Update resume with analysis results
      await updateDoc(doc(db, 'resumes', resumeId), {
        atsScore: analysis.score,
        'analysis.strengths': analysis.strengths,
        'analysis.weaknesses': analysis.weaknesses,
        'analysis.suggestions': analysis.suggestions,
        lastAnalyzed: serverTimestamp()
      });

      return analysis;
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume');
    }
  }
}

// Export singleton instance
export const resumeService = ResumeService.getInstance();
'@

Set-Content -Path $resumeServicePath -Value $resumeServiceContent

# Create index file for resume service
$resumeServiceIndexPath = "src/lib/services/resume/index.ts"
$resumeServiceIndexContent = @'
export * from './resume.service';
'@
Set-Content -Path $resumeServiceIndexPath -Value $resumeServiceIndexContent

# Create index file for services
$servicesIndexPath = "src/lib/services/index.ts"
$servicesIndexContent = @'
export * from './auth/auth.service';
export * from './ai/ai.service';
export * from './resume/resume.service';
export * from './settings/settings.service';
export * from './metrics.service';
export * from './rate-limit.service';
export * from './redis.service';
'@
Set-Content -Path $servicesIndexPath -Value $servicesIndexContent

# Update imports in key files to match new structure
Write-Host "Updating imports in key files to match new structure..." -ForegroundColor Magenta

# Helper function to update imports in files
function Update-Imports {
    param (
        [string]$FilePath,
        [hashtable]$ImportMap
    )

    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw

        foreach ($oldImport in $ImportMap.Keys) {
            $newImport = $ImportMap[$oldImport]
            $content = $content -replace [regex]::Escape($oldImport), $newImport
        }

        Set-Content -Path $FilePath -Value $content
        Write-Host "Updated imports in $FilePath" -ForegroundColor Green
    } else {
        Write-Host "Warning: File not found for import updates: $FilePath" -ForegroundColor Yellow
    }
}

# Update all TypeScript/TSX files to use new import paths
$tsFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"
foreach ($file in $tsFiles) {
    $importMap = @{
        "import { auth, db } from '@/lib/firebase';" = "import { auth, db } from '@/lib/services/auth/firebase.client';"
        "import { auth } from '@/lib/firebase-admin';" = "import { auth } from '@/lib/services/auth/firebase.admin';"
        "import { useAuth } from '@/lib/auth';" = "import { useAuth } from '@/lib/services/auth/auth.service';"
        "import { ai } from '@/lib/ai/ai.service';" = "import { ai } from '@/lib/services/ai/ai.service';"
        "import { settings } from '@/lib/settings';" = "import { settings } from '@/lib/services/settings/settings.service';"
        "import { rateLimit } from '@/lib/rate-limit';" = "import { rateLimit } from '@/lib/services/rate-limit.service';"
        "import { metrics } from '@/lib/metrics';" = "import { metrics } from '@/lib/services/metrics.service';"
        "import { redis } from '@/lib/redis';" = "import { redis } from '@/lib/services/redis.service';"
        "@/lib/ai-utils" = "@/lib/services/ai/ai-utils"
        "@/lib/resumes" = "@/lib/services/resume"
        "@/types/resume.types" = "@/types/resume"
        "@/types/api.types" = "@/types/api"
    }

    Update-Imports -FilePath $file.FullName -ImportMap $importMap
}

# Create barrel files for components
$componentBarrels = @{
    "src/components/auth/index.tsx" = "export * from './AuthButton';"
    "src/components/dashboard/index.tsx" = "export * from './Sidebar';"
    "src/components/resume/index.tsx" = "export * from './ResumeEditor'`nexport * from './TextEditor';"
    "src/components/settings/index.tsx" = "export * from './SettingsPanel';"
}

foreach ($barrel in $componentBarrels.Keys) {
    Set-Content -Path $barrel -Value $componentBarrels[$barrel]
    Write-Host "Created barrel file: $barrel" -ForegroundColor Green
}

# Create root barrel file for components
$rootComponentBarrel = "src/components/index.ts"
$rootComponentBarrelContent = @'
export * from './ui';
export * from './auth';
export * from './dashboard';
export * from './resume';
export * from './settings';
export * from './ai';
export * from './ErrorBoundary';
'@
Set-Content -Path $rootComponentBarrel -Value $rootComponentBarrelContent

# Create .gitkeep files for empty directories
$emptyDirs = Get-ChildItem -Path "src" -Directory -Recurse | Where-Object { (Get-ChildItem -Path $_.FullName -File -Recurse).Count -eq 0 }
foreach ($dir in $emptyDirs) {
    $gitkeepPath = Join-Path -Path $dir.FullName -ChildPath ".gitkeep"
    New-Item -ItemType File -Path $gitkeepPath -Force | Out-Null
    Write-Host "Created .gitkeep in empty directory: $($dir.FullName)" -ForegroundColor Gray
}

# Update README.md with new project structure
$readmePath = "README.md"
$readmeContent = @'
# qontxt - AI-Powered Resume Builder

## Project Structure

```
src/
├── app/               # Next.js App Router
│   ├── (auth)/        # Authentication pages
│   ├── (dashboard)/   # Dashboard pages
│   │   └── resumes/   # Resume management
│   └── api/           # API routes
│       ├── ai/        # AI processing endpoints
│       ├── auth/      # Authentication endpoints
│       ├── resume/    # Resume management endpoints
│       └── settings/  # User settings endpoints
├── components/        # React components
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard components
│   ├── resume/        # Resume editing components
│   ├── settings/      # Settings components
│   ├── ai/            # AI analysis components
│   └── ui/            # Reusable UI components
├── lib/               # Core business logic
│   ├── services/      # Service layer
│   │   ├── auth/      # Authentication services
│   │   ├── ai/        # AI services
│   │   ├── resume/    # Resume services
│   │   └── settings/  # Settings services
│   └── utils/         # Utility functions
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Firebase (Firestore)
- **Authentication**: Firebase Auth
- **AI Integration**: OpenAI, Google Gemini
- **Hosting**: Vercel
'@
Set-Content -Path $readmePath -Value $readmeContent

Write-Host "Project cleanup complete!" -ForegroundColor Green
Write-Host "Backup created at: ../$backupFolder" -ForegroundColor Cyan
Write-Host "Please review the changes and run 'npm install' to ensure all dependencies are installed." -ForegroundColor Yellow
