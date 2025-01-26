import { db } from './firebase';
import { Resume, ResumeSection } from '@/types/resume';
import { doc, collection, setDoc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';

export const resumeService = {
  createResume: async (userId: string): Promise<string> => {
    const resumeRef = doc(collection(db, 'resumes'));

    const baseResume: Resume = {
      id: resumeRef.id,
      user_id: userId,
      version: 'base',
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
      metadata: {
        status: 'draft'
      }
    };

    await setDoc(resumeRef, baseResume);
    return resumeRef.id;
  },

  updateSection: async (
    resumeId: string,
    section: ResumeSection
  ): Promise<void> => {
    const sectionRef = doc(db, 'resumes', resumeId, section.type, 'primary');
    await setDoc(sectionRef, section.data, { merge: true });
  },

  getResume: async (resumeId: string): Promise<Resume | null> => {
    const docRef = doc(db, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Resume : null;
  }
};
