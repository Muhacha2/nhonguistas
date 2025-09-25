'use client';

import type { User } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  bio: z.string().max(160, { message: 'Bio cannot exceed 160 characters.' }).optional(),
  interests: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm({ user }: { user: User }) {
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      bio: user.bio,
      interests: user.interests.join(', '),
    },
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-foreground">Name</FormLabel>
                <FormControl>
                    <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-foreground">Username</FormLabel>
                <FormControl>
                    <Input placeholder="your_username" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Interests</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Hiking, Coding, Coffee" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
