import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  created_at: Timestamp;
  last_login: Timestamp;
  parent_resume_id: string | null;
}

export interface Resume {
  id: string;
  user_id: string;
  version: 'base' | 'generated';
  created_at: Timestamp;
  updated_at: Timestamp;
  job_description?: string;
  metadata: {
    company?: string;
    position?: string;
    status: 'draft' | 'published';
  };
}

// Add other interfaces from your schema here
