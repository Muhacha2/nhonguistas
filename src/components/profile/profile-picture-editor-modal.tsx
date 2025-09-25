
'use client';

import { useState, useRef } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';

interface ProfilePictureEditorModalProps {
  imageSrc: string;
  onClose: () => void;
}

export function ProfilePictureEditorModal({ imageSrc, onClose }: ProfilePictureEditorModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleSave = async () => {
    if (!cropperRef.current?.cropper || !auth.currentUser) {
      return;
    }
    setIsLoading(true);

    // This is a workaround. Firebase Auth has a URL length limit for photoURL,
    // which is often too small for a base64-encoded image data URL.
    // The ideal solution is to upload to Firebase Storage and save the URL.
    // As a prototype-friendly alternative, we save the image to localStorage.
    try {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      if (!croppedCanvas) {
        throw new Error('Could not get cropped canvas.');
      }
      
      const photoURL = croppedCanvas.toDataURL('image/png'); // PNG for better quality on avatars
      
      localStorage.setItem(`photoURL_${auth.currentUser.uid}`, photoURL);

      toast({
        title: 'Foto de Perfil Atualizada!',
        description: 'Sua nova foto de perfil foi salva (localmente).',
      });

      // Reload to show the new picture everywhere
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 500);

    } catch (error: any) {
      toast({
        title: 'Erro ao salvar a foto',
        description: error.message,
        variant: 'destructive',
      });
      console.error("Error saving photo locally:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Foto de Perfil</DialogTitle>
        </DialogHeader>
        <div className="w-full h-[300px] bg-muted mt-4">
          <Cropper
            ref={cropperRef}
            src={imageSrc}
            style={{ height: '100%', width: '100%' }}
            aspectRatio={1}
            guides={false}
            viewMode={1}
            dragMode="move"
            background={false}
            autoCropArea={0.8}
            cropBoxMovable={false}
            cropBoxResizable={false}
          />
        </div>
        <DialogFooter className='mt-4'>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
