
'use client';

import type { Glance } from '@/lib/types';
import { Send, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type PostModalProps = {
  glance: Glance;
  onClose: () => void;
  isOpen: boolean;
  onCommentSubmit: (glanceId: string, commentText: string) => void;
};

export function PostModal({ glance, onClose, isOpen, onCommentSubmit }: PostModalProps) {
  const [newComment, setNewComment] = useState('');

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onCommentSubmit(glance.id, newComment.trim());
    setNewComment('');
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 border-0 bg-background max-w-lg h-screen flex flex-col focus-visible:ring-0 focus-visible:ring-offset-0">
            <header className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-bold text-lg">Comentários</h2>
                <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    <X className="w-5 h-5" />
                    <span className="sr-only">Fechar</span>
                </button>
            </header>
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border">
                    <div className="flex items-start space-x-3">
                        <Image src={glance.author.avatarUrl} alt={glance.author.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="text-sm">
                                <span className="font-bold">{glance.author.username}</span>
                                <span className="ml-2 text-muted-foreground">{glance.content}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                     {glance.comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="font-semibold">Nenhum comentário ainda</p>
                            <p className="text-sm text-muted-foreground">Seja o primeiro a comentar.</p>
                        </div>
                     ) : (
                        <ul className="space-y-4">
                            {glance.comments.map((comment) => (
                                <li key={comment.id} className="flex items-start space-x-3">
                                    <Image 
                                        src={comment.author.avatarUrl} 
                                        alt={comment.author.name}
                                        width={32}
                                        height={32}
                                        className="rounded-full w-8 h-8 object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-semibold">{comment.author.username}</span>
                                            <span className="ml-2 text-muted-foreground">{comment.content}</span>
                                        </p>
                                        <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                     )}
                </ScrollArea>

                <div className="border-t border-border p-4 bg-background">
                    <form onSubmit={handlePostComment} className="flex items-center space-x-2">
                        <Input 
                            type="text" 
                            placeholder="Adicione um comentário..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <Button type="submit" size="icon" disabled={!newComment.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
}
