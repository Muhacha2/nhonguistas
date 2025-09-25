
import type { User as FirebaseUser } from 'firebase/auth';

export type User = {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  interests: string[];
};

export type Comment = {
  id: string;
  author: User;
  content: string;
  createdAt: string; // ISO 8601 date string
};

export type Glance = {
  id: string;
  author: User;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  createdAt: string; // ISO 8601 date string
  likes: number;
  comments: Comment[];
  shares?: number;
};

// Extends the default Firebase user type with our custom fields
export type ExtendedFirebaseUser = FirebaseUser & {
  bio?: string;
}
