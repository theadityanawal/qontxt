import { ResumeData, ResumeMetadata } from '@/types/resume.types';
import { db } from './firebase';
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

// Simple Resume Service for MVP
export const resumeService = {
  /**
   * Create a new resume for a user
   */
  createResume: async (userId: string, title: string): Promise<string> => {
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
  },

  /**
   * Get a resume by ID
   */
  getResumeById: async (resumeId: string): Promise<ResumeData | null> => {
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
  },

  /**
   * Get all resumes for a user
   */
  getUserResumes: async (userId: string): Promise<ResumeMetadata[]> => {
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
          status: data.status
        } as ResumeMetadata;
      });
    } catch (error) {
      console.error('Error getting user resumes:', error);
      throw new Error('Failed to get user resumes');
    }
  },

  /**
   * Update a resume
   */
  updateResume: async (
    resumeId: string,
    data: Partial<ResumeData>,
    userId: string
  ): Promise<void> => {
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
  },

  /**
   * Delete a resume
   */
  deleteResume: async (resumeId: string, userId: string): Promise<void> => {
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
};
