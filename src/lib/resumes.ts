import { db } from './firebase';
import { Resume, ResumeSection } from '@/types/resume.types';
import { doc, collection, setDoc, updateDoc, getDoc, Timestamp, getDocs, query, where, orderBy } from 'firebase/firestore';

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

export async function getUserResumes(userId: string): Promise<ResumeMetadata[]> {
  const resumesQuery = query(
    collection(db, 'resumes'),
    where('userId', '==', userId),
    orderBy('lastModified', 'desc')
  );

  const snapshot = await getDocs(resumesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ResumeMetadata));
}

export async function getResumeById(resumeId: string): Promise<ResumeData | null> {
  const docRef = doc(db, 'resumes', resumeId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as ResumeData;
}

export async function saveResume(
  resumeId: string,
  data: ResumeData,
  userId: string
): Promise<void> {
  const docRef = doc(db, 'resumes', resumeId);
  await setDoc(docRef, {
    ...data,
    userId,
    lastModified: new Date().toISOString(),
  }, { merge: true });
}

export async function createNewResume(
  userId: string,
  title: string
): Promise<string> {
  const newResumeRef = doc(collection(db, 'resumes'));
  await setDoc(newResumeRef, {
    userId,
    title,
    status: 'draft',
    lastModified: new Date().toISOString(),
    summary: '',
    experience: [],
    education: [],
    skills: []
  });

  return newResumeRef.id;
}

export function analyzeResume(data: ResumeData): number {
  // Basic scoring algorithm - replace with actual AI analysis
  let score = 0;

  // Check summary
  if (data.summary && data.summary.length > 50) score += 20;

  // Check experience
  if (data.experience?.length) {
    score += Math.min(data.experience.length * 15, 30);
    // Check experience descriptions
    score += data.experience.reduce((acc, exp) =>
      acc + (exp.description.length > 100 ? 10 : 5), 0) / data.experience.length;
  }

  // Check education
  if (data.education?.length) score += 20;

  // Check skills
  if (data.skills?.length) {
    score += Math.min(data.skills.length * 2, 20);
  }

  return Math.min(score, 100);
}
