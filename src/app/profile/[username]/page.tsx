
'use client';

import { users } from '@/lib/data';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';


export default function UserProfilePage({ params }: { params: { username: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const { user: currentUser, loading } = useAuth();
    
    // Find user from mock data. In a real app, this would be a database lookup.
    const user = users.find(u => u.username === params.username);
    
    const isCurrentUser = currentUser?.email?.split('@')[0] === params.username;

    const [isFollowing, setIsFollowing] = useState(false);

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
    };

    if (loading) {
        return <main className="page active flex-col items-center justify-center p-4">Carregando...</main>;
    }

    if (!user) {
        return <main className="page active flex-col items-center justify-center p-4">Usuário não encontrado.</main>;
    }

    return (
        <main className="page active flex-col p-4 pt-16 pb-24 h-full scroll-container">
            <div className="flex flex-col items-center mb-6 w-full max-w-md mx-auto">
               
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-blue-400 shadow-lg flex items-center justify-center mb-4 overflow-hidden">
                        <Image id="profile-avatar" width={128} height={128} src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                </div>
                
                <div className="w-full max-w-xs space-y-4 text-center text-foreground">
                    <h2 className="text-3xl font-bold">{user.name}</h2>
                    <p className="text-lg font-semibold text-muted-foreground">@{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                    
                    <div className="flex justify-center space-x-6 mt-4">
                        <div className="text-center px-3 py-2 rounded-xl bg-card backdrop-blur-md shadow-md border border-border">
                            <p className="font-bold">12</p>
                            <p className="text-xs text-muted-foreground">Publicações</p>
                        </div>
                        <div className="text-center px-3 py-2 rounded-xl bg-card backdrop-blur-md shadow-md border border-border">
                            <p className="font-bold">1.2k</p>
                            <p className="text-xs text-muted-foreground">Seguidores</p>
                        </div>
                        <div className="text-center px-3 py-2 rounded-xl bg-card backdrop-blur-md shadow-md border border-border">
                            <p className="font-bold">345</p>
                            <p className="text-xs text-muted-foreground">Seguindo</p>
                        </div>
                    </div>
                    
                    {isCurrentUser ? (
                         <button onClick={() => router.push('/profile')} className="py-2 px-6 rounded-full border border-border text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                            Ver Meu Perfil
                        </button>
                    ) : (
                        <button 
                            onClick={handleFollow}
                            className={`px-6 py-2 rounded-full font-bold text-sm shadow transition text-white ${isFollowing ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}>
                            {isFollowing ? 'Seguindo' : 'Seguir'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md mx-auto justify-items-center items-center">
                 <p className="col-span-2 text-muted-foreground">Nenhuma publicação ainda.</p>
            </div>
        </main>
    );
}
