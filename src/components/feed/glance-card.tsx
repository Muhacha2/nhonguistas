
'use client';

import type { Glance } from '@/lib/types';
import { Heart, MessageCircle, Send, Eye, Mic } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

type GlanceCardProps = {
  glance: Glance;
  onPostClick: (glance: Glance) => void;
  isModalMode?: boolean;
};

export function GlanceCard({ glance, onPostClick, isModalMode = false }: GlanceCardProps) {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const isOwnPost = currentUser?.uid === glance.author.id;
    const [isFollowing, setIsFollowing] = useState(false);

    const [likes, setLikes] = useState(glance.likes);
    const [isLiked, setIsLiked] = useState(false);
    const [shares, setShares] = useState(glance.shares || 0);
    const [isShared, setIsShared] = useState(false);
    
    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFollowing(!isFollowing);
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiked) {
            setLikes(likes - 1);
        } else {
            setLikes(likes + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!isShared) {
            setShares(shares + 1);
            setIsShared(true);
        }
    };

    const handleCommentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPostClick(glance);
    };


    const viewProfile = (e: React.MouseEvent, username: string) => {
        e.stopPropagation();
        router.push(`/profile/${username}`);
    }

  // Media Post Card (Image/Video)
  if (glance.mediaType === 'image' || glance.mediaType === 'video') {
    return (
      <div onClick={() => !isModalMode && onPostClick(glance)} className={`${!isModalMode && 'cursor-pointer'} w-full h-auto aspect-[9/16] max-w-sm bg-card rounded-3xl p-4 flex flex-col justify-between shadow-xl relative`}>
        <div className="absolute inset-0 z-0">
            <Image src={glance.mediaUrl!} alt="Glance media" fill className="w-full h-full object-cover rounded-3xl" data-ai-hint="social media post"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 rounded-3xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div onClick={(e) => viewProfile(e, glance.author.username)} className="flex items-center space-x-2 p-2 rounded-full bg-black/50 backdrop-blur-md w-fit self-start mb-2 cursor-pointer">
              <div className="relative inline-block">
                  <div className="w-8 h-8 rounded-full border-2 shadow flex items-center justify-center overflow-hidden" style={{borderColor: '#60a5fa'}}>
                      <Image src={glance.author.avatarUrl} alt={glance.author.name} width={32} height={32} className="w-full h-full object-cover rounded-full" />
                  </div>
              </div>
              <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">{glance.author.name}</span>
                  <span className="text-xs text-gray-200">@{glance.author.username}</span>
              </div>
          </div>
          {!isOwnPost && !isModalMode && (
              <button 
                  onClick={handleFollow}
                  className={`follow-btn text-white text-xs font-semibold rounded-full px-4 py-1 shadow-md transition-all duration-200 ${isFollowing ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}>
                  {isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
          )}
        </div>

        <div className="relative z-10 flex flex-col space-y-4">
            {!isModalMode && <div className="bg-black/50 text-white p-4 rounded-xl shadow-inner backdrop-blur-md">
                <p className="text-sm">{glance.content}</p>
            </div>}
            {!isModalMode && <div className="flex justify-end space-x-2 items-center">
                <button onClick={handleLike} className="reaction-btn text-2xl transform hover:scale-110 transition-transform duration-200 rounded-full border border-red-300 shadow-md p-2 flex items-center bg-background/60">
                    <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-foreground'}`} />
                    <span className="ml-1 text-base font-bold text-foreground">{likes}</span>
                </button>
                <button onClick={handleShare} className="reaction-btn text-2xl transform hover:scale-110 transition-transform duration-200 rounded-full bg-background/60 border border-blue-300 shadow-md p-2 flex items-center">
                    <Send className={`w-5 h-5 transition-colors ${isShared ? 'text-blue-500' : 'text-foreground'}`} />
                    <span className="ml-1 text-base font-bold text-foreground">{shares}</span>
                </button>
                <button onClick={handleCommentClick} className="comment-btn ml-0 text-2xl transform hover:scale-110 transition-transform duration-200 rounded-full bg-background/60 border border-green-300 shadow-md p-2 flex items-center">
                    <MessageCircle className="w-5 h-5 text-foreground" />
                    <span className="ml-1 text-base font-bold text-foreground">{glance.comments.length}</span>
                </button>
            </div>}
        </div>
      </div>
    );
  }

    // Audio Post Card
    if (glance.mediaType === 'audio') {
        return (
            <Card className="w-full max-w-sm shadow-xl rounded-3xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div onClick={(e) => viewProfile(e, glance.author.username)} className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-10 h-10 rounded-full border-2 shadow flex items-center justify-center overflow-hidden" style={{borderColor: '#60a5fa'}}>
                        <Image src={glance.author.avatarUrl} alt={glance.author.name} width={40} height={40} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{glance.author.name}</p>
                      <p className="text-xs text-muted-foreground">@{glance.author.username}</p>
                    </div>
                  </div>
                   {!isOwnPost && (
                    <button 
                        onClick={handleFollow}
                        className={`follow-btn text-white text-xs font-semibold rounded-full px-4 py-1 shadow-md transition-all duration-200 ${isFollowing ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}>
                        {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                )}
                </div>
                {glance.content && <p className="text-foreground my-4">{glance.content}</p>}
                <div className="my-4">
                    <audio controls src={glance.mediaUrl} className="w-full h-12 rounded-full"></audio>
                </div>
                <div className="flex justify-start space-x-4 items-center text-muted-foreground">
                      <button onClick={handleLike} className="flex items-center gap-1.5 transform hover:scale-110 transition-transform duration-200">
                          <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-foreground'}`} />
                          <span className="text-sm font-bold text-foreground">{likes}</span>
                      </button>
                      <button onClick={handleShare} className="flex items-center gap-1.5 transform hover:scale-110 transition-transform duration-200">
                          <Send className={`w-5 h-5 transition-colors ${isShared ? 'text-blue-500' : 'text-foreground'}`} />
                          <span className="text-sm font-bold text-foreground">{shares}</span>
                      </button>
                      <button onClick={handleCommentClick} className="flex items-center gap-1.5 transform hover:scale-110 transition-transform duration-200">
                          <MessageCircle className="w-5 h-5 text-foreground" />
                          <span className="text-sm font-bold text-foreground">{glance.comments.length}</span>
                      </button>
                  </div>
              </CardContent>
            </Card>
        )
    }

  // Text Post Card (Default)
  return (
    <Card className="w-full max-w-sm shadow-xl rounded-3xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div onClick={(e) => viewProfile(e, glance.author.username)} className="flex items-center space-x-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full border-2 shadow flex items-center justify-center overflow-hidden" style={{borderColor: '#60a5fa'}}>
                <Image src={glance.author.avatarUrl} alt={glance.author.name} width={40} height={40} className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{glance.author.name}</p>
              <p className="text-xs text-muted-foreground">@{glance.author.username}</p>
            </div>
          </div>
           {!isOwnPost && (
            <button 
                onClick={handleFollow}
                className={`follow-btn text-white text-xs font-semibold rounded-full px-4 py-1 shadow-md transition-all duration-200 ${isFollowing ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}>
                {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
        )}
        </div>
        <p className="text-foreground my-4">{glance.content}</p>
        <div className="flex justify-start space-x-4 items-center text-muted-foreground">
              <button onClick={handleLike} className="flex items-center gap-1.5 transform hover:scale-110 transition-transform duration-200">
                  <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-foreground'}`} />
                  <span className="text-sm font-bold text-foreground">{likes}</span>
              </button>
              <button onClick={handleShare} className="flex items-center gap-1.5 transform hover:scale-110 transition-transform duration-200">
                  <Send className={`w-5 h-5 transition-colors ${isShared ? 'text-blue-500' : 'text-foreground'}`} />
                  <span className="text-sm font-bold text-foreground">{shares}</span>
              </button>
              <button onClick={handleCommentClick} className="flex items-center gap-1.5 transform hover:scale-110 transition-transform duration-200">
                  <MessageCircle className="w-5 h-5 text-foreground" />
                  <span className="text-sm font-bold text-foreground">{glance.comments.length}</span>
              </button>
          </div>
      </CardContent>
    </Card>
  )
}

    