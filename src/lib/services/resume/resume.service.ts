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

