
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import type { ExtendedFirebaseUser } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<ExtendedFirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // In a real app, you'd fetch this from Firestore.
        // For this prototype, we'll use localStorage.
        const bio = localStorage.getItem(`bio_${firebaseUser.uid}`);
        
        // For photoURL, we check localStorage first as a workaround for Firebase Auth's
        // data URL length limitations. This allows photo changes to persist locally.
        const localPhotoURL = localStorage.getItem(`photoURL_${firebaseUser.uid}`);
        
        const extendedUser: ExtendedFirebaseUser = {
            ...firebaseUser,
            photoURL: localPhotoURL || firebaseUser.photoURL,
            bio: bio || undefined,
        };
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);

      const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';
      
      if (firebaseUser && isAuthPage) {
        router.push('/feed');
      }
      
      if (!firebaseUser && !isAuthPage) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return { user, loading };
}
