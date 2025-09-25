
'use client';

import { ChangeEvent, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Bot, Loader2, Image as ImageIcon, Type, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Glance, User } from '@/lib/types';
import { glances as initialGlances } from '@/lib/data';
import { AudioRecorder } from './audio-recorder';
import { Button } from '@/components/ui/button';
import { getHashtagSuggestions } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';

const createGlanceSchema = z.object({
  content: z.string().max(280, 'O conteúdo deve ter 280 caracteres ou menos.').optional(),
});

type CreateGlanceValues = z.infer<typeof createGlanceSchema>;

// Helper function to convert a file to a Base64 Data URL for AI processing
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
  const [isAiLoading, setIsAiLoading] = useState(false);
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
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
            title: 'Arquivo Inválido',
            description: 'Por favor, selecione um arquivo de imagem ou vídeo.',
            variant: 'destructive',
        });
        return;
    }

    setPostType('media');
    setMediaFile(file);
    setHashtags([]);
    setError(null);
    
    if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
  };

  const handleGenerateHashtags = async () => {
      if (!mediaFile || !mediaFile.type.startsWith('image/')) return;

      setIsAiLoading(true);
      setError(null);
      setHashtags([]);

      try {
        const base64data = await fileToDataURL(mediaFile);
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
      } catch (e: any) {
        setError("A sugestão de hashtag da AI falhou.");
         toast({
            title: 'Erro de Rede',
            description: 'Não foi possível se conectar ao serviço de IA.',
            variant: 'destructive'
          })
      } finally {
        setIsAiLoading(false);
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

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast({
        title: 'Configuração Incompleta',
        description: 'As credenciais de upload do Cloudinary não foram encontradas. Verifique suas variáveis de ambiente.',
        variant: 'destructive',
      });
      return;
    }

    setIsPublishing(true);

    let mediaUrl: string | undefined;
    let finalMediaType: 'image' | 'video' | 'audio' | undefined;

    try {
        const fileToUpload = postType === 'media' ? mediaFile : (audioData?.blob ? new File([audioData.blob], "audio.webm", { type: "audio/webm" }) : null);

        if (fileToUpload) {
            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('upload_preset', uploadPreset);
            
            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: 'POST',
                body: formData,
            });
            
            const result = await uploadResponse.json();

            if (!uploadResponse.ok || result.error) {
                console.error('Cloudinary Error:', result.error);
                throw new Error(result.error?.message || 'Falha no upload para o Cloudinary');
            }
            
            mediaUrl = result.secure_url;

            if (result.resource_type === 'image') {
              finalMediaType = 'image';
            } else if (result.resource_type === 'video') {
              finalMediaType = result.is_audio ? 'audio' : 'video';
            }
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
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        shares: 0,
        mediaUrl: mediaUrl,
        mediaType: finalMediaType,
    };
    
    const storedGlances = localStorage.getItem('glances_data');
    const currentGlances = storedGlances ? JSON.parse(storedGlances) : initialGlances;
    const updatedGlances = [newGlance, ...currentGlances];
    
    localStorage.setItem('glances_data', JSON.stringify(updatedGlances));

    toast({
      title: 'Glance Publicado!',
      description: 'Seu novo Glance foi publicado com sucesso.',
    });
    
    setIsPublishing(false);
    resetForm();
    router.push('/feed');
  }

  const resetForm = () => {
    form.reset();
    if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setMediaFile(null);
    setHashtags([]);
    setPostType(null);
  }

  const renderInitialState = () => (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button onClick={() => document.getElementById('glance-upload-file')?.click()} className="w-full sm:w-auto">
            <ImageIcon className="mr-2" /> Foto ou Vídeo
        </Button>
        <Button onClick={() => setPostType('text')} variant="secondary" className="w-full sm:w-auto">
            <Type className="mr-2"/> Texto
        </Button>
        <Button onClick={() => setPostType('audio')} variant="secondary" className="w-full sm:w-auto">
            <Mic className="mr-2"/> Gravar Áudio
        </Button>
        <input id="glance-upload-file" type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
    </div>
  );

  const renderMediaForm = () => (
    <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="w-full max-w-sm space-y-4">
         <div className="relative aspect-video w-full mx-auto overflow-hidden rounded-lg bg-muted border">
            {preview && mediaFile?.type.startsWith('image/') && <Image src={preview} alt="Media preview" fill className="object-cover" />}
            {preview && mediaFile?.type.startsWith('video/') && <video src={preview} controls className="w-full h-full object-cover" />}
        </div>
         <Textarea
            {...form.register('content')}
            placeholder="Escreva uma descrição..."
            className="w-full"
            rows={3}
        />

        {mediaFile?.type.startsWith('image/') && (
             <Button type="button" onClick={handleGenerateHashtags} disabled={isAiLoading} variant="outline" className="w-full">
                {isAiLoading ? <Loader2 className="animate-spin" /> : <Bot />}
                Sugerir Hashtags com IA
            </Button>
        )}
        
        {error && <p className='text-sm text-destructive text-center'>{error}</p>}

        {hashtags.length > 0 && (
            <div className='space-y-2 rounded-lg border bg-card p-3'>
                <h3 className='font-semibold text-foreground text-sm'>Sugestões da IA:</h3>
                <div className='flex flex-wrap gap-2'>
                    {hashtags.map((tag) => (
                        <button key={tag} type="button" className='cursor-pointer bg-muted px-2 py-1 rounded-md text-xs hover:bg-primary/10' onClick={() => form.setValue('content', `${form.getValues('content')} ${tag}`.trim())}>
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button type="button" onClick={resetForm} variant="ghost" disabled={isPublishing}>Cancelar</Button>
          <Button type="submit" disabled={isPublishing}>
             {isPublishing ? <Loader2 className="animate-spin" /> : 'Publicar'}
          </Button>
        </div>
    </form>
  );

  const renderTextForm = () => (
     <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="w-full max-w-md space-y-4">
        <Textarea
            {...form.register('content')}
            placeholder="No que você está pensando?"
            className="w-full text-lg"
            rows={6}
            autoFocus
        />
        {form.formState.errors.content && <p className="text-destructive text-xs">{form.formState.errors.content.message}</p>}
        <div className="flex justify-between items-center">
          <Button type="button" onClick={resetForm} variant="ghost" disabled={isPublishing}>Cancelar</Button>
          <Button type="submit" disabled={isPublishing}>
            {isPublishing ? <Loader2 className="animate-spin" /> : 'Publicar'}
          </Button>
        </div>
     </form>
  );

  const renderAudioForm = () => (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
        <AudioRecorder
            onRecordingComplete={(audioData) => {
                form.handleSubmit((formData) => onSubmit(formData, audioData))();
            }}
            isPublishing={isPublishing}
        />
        <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="w-full space-y-4">
            <Textarea
                {...form.register('content')}
                placeholder="Adicione uma descrição para o seu áudio..."
                rows={2}
            />
        </form>
        <Button type="button" onClick={resetForm} variant="ghost" disabled={isPublishing}>
            Voltar
        </Button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-sm mb-8 text-center">
             <h1 className="text-3xl font-bold mb-2">Criar um novo Glance</h1>
             <p className="text-muted-foreground">Compartilhe uma foto, vídeo, texto ou áudio.</p>
        </div>
        {!postType && renderInitialState()}
        {postType === 'media' && renderMediaForm()}
        {postType === 'text' && renderTextForm()}
        {postType === 'audio' && renderAudioForm()}
    </div>
  );
}

    