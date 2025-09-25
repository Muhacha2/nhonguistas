
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import type { ExtendedFirebaseUser } from '@/lib/types';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const profileSchema = z.object({
  displayName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').max(50, 'O nome não pode ter mais de 50 caracteres.'),
  bio: z.string().max(160, 'A biografia não pode ter mais de 160 caracteres.').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  user: ExtendedFirebaseUser;
  onClose: () => void;
}

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || '',
      bio: user.bio || '',
    },
  });

  // This effect ensures the form is re-populated if the user prop changes
  // while the modal is open.
  useEffect(() => {
    form.reset({
        displayName: user.displayName || '',
        bio: user.bio || '',
    });
  }, [user, form]);


  async function onSubmit(data: ProfileFormValues) {
    if (!auth.currentUser) {
        toast({ title: 'Erro', description: 'Nenhum usuário autenticado.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    try {
        await updateProfile(auth.currentUser, {
            displayName: data.displayName,
        });

        // NOTE: Custom fields like 'bio' are not part of the standard Firebase User profile.
        // In a real application, you would save this to a Firestore 'users' collection
        // associated with the user's UID. For this prototype, we'll use localStorage.
        if (data.bio) {
            localStorage.setItem(`bio_${user.uid}`, data.bio);
        } else {
            localStorage.removeItem(`bio_${user.uid}`);
        }
        

      toast({
        title: 'Perfil Atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
      
      // A small delay to allow data to propagate before closing, then force a reload
      // to ensure the profile page reflects the latest user data including bio.
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 500);

    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="displayName" className="text-sm font-medium">Nome</label>
                <Input id="displayName" {...form.register('displayName')} className="mt-1" />
                {form.formState.errors.displayName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.displayName.message}</p>}
            </div>
            <div>
                <label htmlFor="bio" className="text-sm font-medium">Biografia</label>
                <Textarea id="bio" {...form.register('bio')} className="mt-1 resize-none" />
                {form.formState.errors.bio && <p className="text-red-500 text-xs mt-1">{form.formState.errors.bio.message}</p>}
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
