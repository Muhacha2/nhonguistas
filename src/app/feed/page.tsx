
'use client';

import { useState, useEffect } from 'react';
import { GlanceCard } from '@/components/feed/glance-card';
import { glances as initialGlances, users } from '@/lib/data';
import type { Glance, Comment } from '@/lib/types';
import { Logo } from '@/components/shared/logo';
import { MessageCircle } from 'lucide-react';
import { PostModal } from '@/components/feed/post-modal';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { user, loading } = useAuth();
  const [glances, setGlances] = useState<Glance[]>([]);
  const [selectedGlance, setSelectedGlance] = useState<Glance | null>(null);

  const isModalOpen = !!selectedGlance;

  useEffect(() => {
    // Load glances from localStorage or use initial data
    const storedGlances = localStorage.getItem('glances_data');
    if (storedGlances) {
      setGlances(JSON.parse(storedGlances));
    } else {
      setGlances(initialGlances);
    }
  }, []);

  useEffect(() => {
    const body = document.body;
    if (isModalOpen) {
        body.classList.add('overflow-hidden', 'modal-open');
    } else {
        body.classList.remove('overflow-hidden', 'modal-open');
    }

    return () => {
        body.classList.remove('overflow-hidden', 'modal-open');
    };
  }, [isModalOpen]);

  const handleAddComment = (glanceId: string, commentText: string) => {
    if (!user) return;

    const currentUserForComment = users.find(u => u.username === user.email?.split('@')[0]) || users[0];

    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: currentUserForComment,
      content: commentText,
      createdAt: 'agora',
    };

    const updatedGlances = glances.map(glance => {
      if (glance.id === glanceId) {
        const updatedComments = [...glance.comments, newComment];
        return { ...glance, comments: updatedComments };
      }
      return glance;
    });

    setGlances(updatedGlances);
    localStorage.setItem('glances_data', JSON.stringify(updatedGlances)); // Persist comments

    // Also update the selectedGlance if it's the one being commented on
    if (selectedGlance && selectedGlance.id === glanceId) {
        setSelectedGlance(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    }
  };


  const openPostModal = (glance: Glance) => {
    setSelectedGlance(glance);
  };

  const closePostModal = () => {
    setSelectedGlance(null);
  };

  if (loading || glances.length === 0) {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 pt-16 pb-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando feed...</p>
        </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 pt-20 pb-24">
      <header className="w-full max-w-md fixed top-0 left-1/2 -translate-x-1/2 z-40 bg-background shadow-md flex items-center justify-between h-14 px-4">
        <Logo />
        <div className="flex items-center gap-2">
            <button className="flex items-center justify-center w-10 h-10 p-2 rounded hover:bg-accent transition select-none">
                <MessageCircle className="w-7 h-7 text-primary" />
            </button>
        </div>
      </header>

      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        {glances.map((glance) => (
          <GlanceCard key={glance.id} glance={glance} onPostClick={openPostModal} />
        ))}
      </div>

      {selectedGlance && (
        <PostModal 
            glance={selectedGlance} 
            onClose={closePostModal} 
            isOpen={isModalOpen} 
            onCommentSubmit={handleAddComment}
        />
      )}
    </main>
  );
}
