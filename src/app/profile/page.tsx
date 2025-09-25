
'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { useState } from 'react';
import { EditProfileModal } from '@/components/profile/edit-profile-modal';
import { ProfilePictureEditorModal } from '@/components/profile/profile-picture-editor-modal';

export default function ProfilePage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { toast } = useToast();
    const { user, loading } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error: any) {
            toast({
                title: 'Error signing out',
                description: error.message,
                variant: 'destructive'
            })
        }
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setSelectedPhoto(event.target.result as string);
                    setIsPhotoEditorOpen(true);
                }
            };
            reader.readAsDataURL(file);
        }
    };


    if (loading) {
        return (
            <main className="flex flex-col items-center justify-center min-h-screen p-4 pt-16 pb-24">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
            </main>
        );
    }

    if (!user) {
        // This should ideally not be visible as the hook will redirect.
        // But as a fallback:
        return (
             <main className="flex flex-col items-center justify-center min-h-screen p-4 pt-16 pb-24">
                <p>Você não está autenticado.</p>
             </main>
        )
    }

    return (
        <>
            <main className="flex flex-col items-center justify-start min-h-screen p-4 pt-16 pb-24">
                <div className="flex flex-col items-center mb-6 w-full max-w-md mx-auto">
                    <div className="w-full flex justify-between items-center mb-2">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent transition-colors">
                            {theme === 'dark' ? <Sun className="text-yellow-400" /> : <Moon />}
                        </button>
                         <button onClick={handleLogout} className="py-2 px-6 bg-red-500 text-white font-semibold rounded-xl shadow hover:bg-red-600 transition-all duration-200">Sair</button>
                    </div>
                   
                    <div className="relative">
                        <input 
                            type="file" 
                            id="photo-upload" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handlePhotoSelect}
                        />
                        <div 
                            className="w-32 h-32 rounded-full border-4 border-blue-400 shadow-lg flex items-center justify-center mb-4 overflow-hidden cursor-pointer"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                            <Image id="profile-avatar" width={128} height={128} src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} alt={user.displayName || 'User Avatar'} className="w-full h-full object-cover rounded-full" />
                        </div>
                    </div>
                    
                    <div className="w-full max-w-xs space-y-4 text-center text-foreground">
                        <h2 className="text-3xl font-bold">{user.displayName || 'Usuário Glance'}</h2>
                        <p className="text-lg font-semibold text-muted-foreground">@{user.email?.split('@')[0]}</p>
                        <p className="text-sm text-muted-foreground">{user.bio || 'Bem-vindo(a) ao Glance!'}</p>
                        
                        <div className="flex justify-center space-x-6 mt-4">
                            <div className="text-center px-3 py-2 rounded-xl bg-card backdrop-blur-md shadow-md border border-border">
                                <p className="font-bold">0</p>
                                <p className="text-xs text-muted-foreground">Publicações</p>
                            </div>
                            <div className="text-center px-3 py-2 rounded-xl bg-card backdrop-blur-md shadow-md border border-border">
                                <p className="font-bold">0</p>
                                <p className="text-xs text-muted-foreground">Seguidores</p>
                            </div>
                            <div className="text-center px-3 py-2 rounded-xl bg-card backdrop-blur-md shadow-md border border-border">
                                <p className="font-bold">0</p>
                                <p className="text-xs text-muted-foreground">Seguindo</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="py-2 px-6 rounded-full border border-border text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                            Editar Perfil
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md mx-auto justify-items-center items-center">
                    <p className="col-span-2 text-muted-foreground">Nenhuma publicação ainda.</p>
                </div>
            </main>
            {isEditModalOpen && user && (
                <EditProfileModal
                    user={user}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
            {isPhotoEditorOpen && selectedPhoto && (
                <ProfilePictureEditorModal
                    imageSrc={selectedPhoto}
                    onClose={() => {
                        setIsPhotoEditorOpen(false);
                        setSelectedPhoto(null);
                    }}
                />
            )}
        </>
    );
}
