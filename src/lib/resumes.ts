import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

interface BaseResume {
  user_id: string;
  version_type: 'base';
  created_at: ReturnType<typeof serverTimestamp>;
  updated_at: ReturnType<typeof serverTimestamp>;
  metadata: {
    status: 'draft' | 'published';
  };
}

export const createBaseResume = async (userId: string) => {
  const resumeRef = doc(db, 'resumes');

  const resumeData: BaseResume = {
    user_id: userId,
    version_type: 'base',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    metadata: {
      status: 'draft'
    }
  };

  await setDoc(resumeRef, resumeData);

  // Update user document with base resume ID
  await setDoc(doc(db, 'users', userId), {
    base_resume_id: resumeRef.id
  }, { merge: true });

  return resumeRef.id;
};
