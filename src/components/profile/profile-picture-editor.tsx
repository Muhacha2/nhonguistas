'use client';

import { useState, useRef, ChangeEvent } from 'react';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useToast } from '@/hooks/use-toast';

export function ProfilePictureEditor({ user }: { user: User }) {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState(user.avatarUrl);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setIsDialogOpen(true);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const getCropData = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      setCroppedImage(cropper.getCroppedCanvas().toDataURL());
      setIsDialogOpen(false);
      toast({
        title: 'Profile Picture Updated',
        description: 'Your new avatar has been saved.',
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      <Avatar
        className="h-32 w-32 cursor-pointer ring-2 ring-primary ring-offset-2 ring-offset-background"
        onClick={handleAvatarClick}
      >
        <AvatarImage src={croppedImage} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Button variant="outline" onClick={handleAvatarClick}>
        Change Picture
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crop your new picture</DialogTitle>
          </DialogHeader>
          {image && (
            <Cropper
              ref={cropperRef}
              style={{ height: 400, width: '100%' }}
              zoomTo={0.5}
              initialAspectRatio={1}
              preview=".img-preview"
              src={image}
              viewMode={1}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
              guides={true}
            />
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={getCropData}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
