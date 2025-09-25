
'use client';

import { ChangeEvent, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getHashtagSuggestions } from '@/lib/actions';
import { Bot, Loader2, Image as ImageIcon, Video, Type, Mic, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Glance, User } from '@/lib/types';
import { glances as initialGlances } from '@/lib/data';
import { AudioRecorder } from './audio-recorder';
import { Button } from '@/components/ui/button';

const createGlanceSchema = z.object({
  content: z.string().max(280, 'O conteúdo deve ter 280 caracteres ou menos.').optional(),
});

type CreateGlanceValues = z.infer<typeof createGlanceSchema>;


// Helper function to convert a file to a Base64 Data URL
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function CreateGlanceForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [postType, setPostType] = useState<'media' | 'text' | 'audio' | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateGlanceValues>({
    resolver: zodResolver(createGlanceSchema),
    defaultValues: {
      content: '',
    },
  });

   // Clean up the object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
        toast({
            title: 'Arquivo Inválido',
            description: 'Por favor, selecione um arquivo de imagem, vídeo ou áudio.',
            variant: 'destructive',
        });
        return;
    }

    setPostType('media');
    setMediaFile(file);
    setHashtags([]);
    setError(null);
    
    if (preview) {
        URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
  };

  const handleGenerateHashtags = async () => {
      if (!mediaFile || !mediaFile.type.startsWith('image/')) return;

      setIsLoading(true);
      setError(null);
      setHashtags([]);

      try {
        const reader = new FileReader();
        reader.readAsDataURL(mediaFile);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const result = await getHashtagSuggestions(base64data);
          if (result.hashtags) {
            setHashtags(result.hashtags);
          } else {
            setError(result.error || 'Ocorreu um erro desconhecido.');
            toast({
              title: 'Falha na Sugestão de IA',
              description: result.error || 'Verifique se o faturamento está habilitado para o seu projeto do Google Cloud.',
              variant: 'destructive'
            })
          }
           setIsLoading(false);
        }
      } catch (e: any) {
        setError("A sugestão de hashtag da AI falhou.");
         toast({
            title: 'Erro de Rede',
            description: 'Não foi possível se conectar ao serviço de IA.',
            variant: 'destructive'
          })
         setIsLoading(false);
      }
  };
  
  async function onSubmit(data: CreateGlanceValues, audioData?: { blob: Blob; url: string }) {
    if (!user) {
        toast({ title: "Erro", description: "Você precisa estar logado para publicar.", variant: "destructive" });
        return;
    }
    
    if (postType === 'text' && !data.content?.trim()) {
        form.setError('content', { type: 'manual', message: 'O conteúdo não pode estar vazio.' });
        return;
    }
    if (postType === 'media' && !mediaFile) {
        toast({ title: "Erro", description: "Nenhum arquivo de mídia selecionado.", variant: "destructive" });
        return;
    }
    if (postType === 'audio' && !audioData) {
        toast({ title: "Erro", description: "Nenhum áudio gravado para publicar.", variant: "destructive" });
        return;
    }

    setIsPublishing(true);

    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | 'audio' | undefined;
    
    try {
        const fileToUpload = postType === 'media' ? mediaFile : (audioData?.blob ? new File([audioData.blob], "audio.webm", { type: audioData.blob.type }) : null);

        if (fileToUpload) {
            const dataUrl = await fileToDataURL(fileToUpload);

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: dataUrl }),
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            mediaUrl = result.secure_url;
            mediaType = result.resource_type;
        }

    } catch (error: any) {
        console.error("Error uploading file:", error);
        toast({
            title: 'Erro de Upload',
            description: error.message || 'Não foi possível enviar o arquivo para a nuvem.',
            variant: 'destructive',
        });
        setIsPublishing(false);
        return;
    }

    const currentUser: User = {
        id: user.uid,
        name: user.displayName || 'Usuário Glance',
        username: user.email?.split('@')[0] || 'usuário',
        bio: user.bio || '',
        avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        interests: []
    };
    
    const newGlance: Glance = {
        id: `g${Date.now()}`,
        author: currentUser,
        content: data.content || '',
        createdAt: 'agora',
        likes: 0,
        comments: [],
        shares: 0,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
    };
    
    const storedGlances = localStorage.getItem('glances_data');
    const currentGlances = storedGlances ? JSON.parse(storedGlances) : initialGlances;
    const updatedGlances = [newGlance, ...currentGlances];
    
    try {
      localStorage.setItem('glances_data', JSON.stringify(updatedGlances));
    } catch (e: any) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            toast({
                title: 'Armazenamento Local Cheio',
                description: 'Não foi possível salvar, o armazenamento local está cheio. Tente limpar publicações antigas.',
                variant: 'destructive',
            });
        } else {
             toast({
                title: 'Erro ao salvar a publicação',
                description: 'Não foi possível salvar a publicação localmente.',
                variant: 'destructive',
            });
        }
        setIsPublishing(false);
        return;
    }

    toast({
      title: 'Glance Publicado!',
      description: 'Seu novo Glance foi publicado com sucesso.',
    });
    
    setIsPublishing(false);
    resetForm();
    router.push('/feed');
    window.scrollTo(0, 0);
  }

  const resetForm = () => {
    form.reset();
    if (preview) {
        URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setMediaFile(null);
    setHashtags([]);
    setPostType(null);
  }

  const renderInitialState = () => (
    <>
        <input id="glance-upload-file" type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={handleFileChange} />
        
        <div className="flex justify-center items-center space-x-4">
            <button onClick={() => document.getElementById('glance-upload-file')?.click()} className="p-3 rounded-full bg-secondary text-secondary-foreground flex items-center gap-2">
                <ImageIcon size={20}/> Foto/Vídeo
            </button>
            <button onClick={() => setPostType('text')} className="p-3 rounded-full bg-secondary text-secondary-foreground flex items-center gap-2">
                <Type size={20}/> Texto
            </button>
            <button onClick={() => setPostType('audio')} className="p-3 rounded-full bg-secondary text-secondary-foreground flex items-center gap-2">
                <Mic size={20}/> Áudio
            </button>
        </div>
    </>
  );

  const renderMediaForm = () => (
    <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="w-full max-w-sm space-y-4">
         <div className="relative aspect-video w-full mx-auto overflow-hidden rounded-lg bg-muted">
            {preview && mediaFile?.type.startsWith('image/') && <Image src={preview} alt="Media preview" fill className="object-cover" />}
            {preview && mediaFile?.type.startsWith('video/') && <video src={preview} controls className="w-full h-full object-cover" />}
            {preview && mediaFile?.type.startsWith('audio/') && (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                     <Mic className="w-16 h-16 text-muted-foreground mb-4" />
                     <p className="text-sm text-muted-foreground mb-2">Arquivo de áudio selecionado:</p>
                     <p className="font-semibold text-foreground text-center">{mediaFile.name}</p>
                     <audio src={preview} controls className="w-full mt-4" />
                </div>
            )}
        </div>
         <textarea
            {...form.register('content')}
            placeholder="Escreva uma descrição..."
            className="w-full p-3 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
            rows={3}
        />

        {mediaFile?.type.startsWith('image/') && (
             <Button type="button" onClick={handleGenerateHashtags} disabled={isLoading} variant="outline" className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : <Bot />}
                Sugerir com IA
            </Button>
        )}
        
        {error && <p className='text-sm text-destructive text-center'>{error}</p>}

        {hashtags.length > 0 && (
            <div className='space-y-2 rounded-lg border border-input bg-card p-4'>
                <div className='flex items-center gap-2'>
                    <Bot className='h-5 w-5 text-primary' />
                    <h3 className='font-semibold text-foreground'>Sugestões de Hashtags da AI:</h3>
                </div>
                <div className='flex flex-wrap gap-2'>
                    {hashtags.map((tag) => (
                        <button key={tag} type="button" className='cursor-pointer hover:bg-primary/10 bg-muted px-2 py-1 rounded-md text-sm' onClick={() => form.setValue('content', `${form.getValues('content')} ${tag}`.trim())}>
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div className="flex justify-between items-center">
          <button type="button" onClick={resetForm} className="py-2 px-4 text-sm text-muted-foreground" disabled={isPublishing}>Cancelar</button>
          <button type="submit" className="py-2 px-6 bg-primary text-primary-foreground font-semibold rounded-2xl" disabled={isPublishing}>
             {isPublishing ? <Loader2 className="animate-spin" /> : 'Publicar'}
          </button>
        </div>
    </form>
  );

  const renderTextForm = () => (
     <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="w-full max-w-md h-full flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={resetForm} className="p-2 rounded-full hover:bg-accent">
                <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">Novo Glance</h2>
            <div className="w-10"></div>
        </div>
        <div className="flex-grow flex flex-col">
            <div className="flex items-start space-x-3">
                <Image 
                    src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/100/100`}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                />
                <div className="flex-1">
                    <p className="font-semibold">{user?.displayName || 'Usuário Glance'}</p>
                    <textarea
                        {...form.register('content')}
                        placeholder="Comece a escrever..."
                        className="w-full bg-transparent text-lg focus:outline-none resize-none mt-1"
                        rows={8}
                    />
                     {form.formState.errors.content && <p className="text-red-500 text-xs">{form.formState.errors.content.message}</p>}
                </div>
            </div>
        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" disabled={isPublishing} className="py-2 px-6 bg-primary text-primary-foreground font-semibold rounded-2xl disabled:opacity-50">
            {isPublishing ? <Loader2 className="animate-spin" /> : 'Publicar'}
          </button>
        </div>
     </form>
  );

  const renderAudioForm = () => (
    <div className="w-full max-w-md h-full flex flex-col p-4 items-center">
        <div className="w-full flex justify-between items-center mb-4">
            <button type="button" onClick={resetForm} className="p-2 rounded-full hover:bg-accent">
                <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">Novo Áudio Glance</h2>
            <div className="w-10"></div>
        </div>
        <div className="flex-grow w-full flex flex-col items-center justify-center">
            <AudioRecorder
                onRecordingComplete={(audioData) => {
                    // We need to use a function form of handleSubmit to pass extra data
                    form.handleSubmit((formData) => onSubmit(formData, audioData))();
                }}
                isPublishing={isPublishing}
             />
            <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="w-full mt-8 space-y-4">
                 <textarea
                    {...form.register('content')}
                    placeholder="Adicione uma descrição..."
                    className="w-full bg-muted text-foreground p-3 rounded-xl border-2 border-input focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                    rows={3}
                />
                 {form.formState.errors.content && <p className="text-red-500 text-xs">{form.formState.errors.content.message}</p>}
                 {/* The submit is handled by the AudioRecorder component */}
            </form>
        </div>
     </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full">
        {!postType && renderInitialState()}
        {postType === 'media' && preview && renderMediaForm()}
        {postType === 'text' && renderTextForm()}
        {postType === 'audio' && renderAudioForm()}
    </div>
  );
}
