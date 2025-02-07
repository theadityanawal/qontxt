import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';
import { z } from 'zod';

// Resume Types
export interface Resume {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published';
  content: {
    personalInfo: {
      name: string;
      email: string;
      phone?: string;
      location: string;
      links: { platform: string; url: string; }[];
    };
    sections: {
      type: 'experience' | 'education' | 'skills' | 'projects';
      items: unknown[];
    }[];
  };
}

// Validation schema
const resumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.object({
    personalInfo: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
      phone: z.string().optional(),
      location: z.string().min(1, 'Location is required'),
      links: z.array(z.object({
        platform: z.string(),
        url: z.string().url('Invalid URL')
      }))
    }),
    sections: z.array(z.object({
      type: z.enum(['experience', 'education', 'skills', 'projects']),
      items: z.array(z.unknown())
    }))
  })
});

// Main resume hook
export function useResume(resumeId?: string) {
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch single resume
  useEffect(() => {
    if (!user || !resumeId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'resumes', resumeId),
      (doc) => {
        if (doc.exists() && doc.data().userId === user.uid) {
          setResume({ id: doc.id, ...doc.data() } as Resume);
        } else {
          setError(new Error('Resume not found'));
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [resumeId, user]);

  // Create resume
  const createResume = async (data: Omit<Resume, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const validated = resumeSchema.parse(data);
      const docRef = doc(collection(db, 'resumes'));
      await setDoc(docRef, {
        ...validated,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.issues[0].message}`);
      }
      throw error;
    }
  };

  // Update resume
  const updateResume = async (data: Partial<Resume>) => {
    if (!user || !resumeId) throw new Error('Invalid operation');

    try {
      const validated = resumeSchema.partial().parse(data);
      await updateDoc(doc(db, 'resumes', resumeId), {
        ...validated,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.issues[0].message}`);
      }
      throw error;
    }
  };

  // Delete resume
  const deleteResume = async () => {
    if (!user || !resumeId) throw new Error('Invalid operation');
    await deleteDoc(doc(db, 'resumes', resumeId));
  };

  return {
    resume,
    loading,
    error,
    createResume,
    updateResume,
    deleteResume
  };
}

// Hook for listing resumes
export function useResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'resumes'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setResumes(
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resume))
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { resumes, loading };
}
