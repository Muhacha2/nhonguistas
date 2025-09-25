'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getPersonalizedFeed } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const initialState = {
  message: '',
  glances: [] as string[],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate My Feed
    </Button>
  );
}

export function NewUserFeedPrompt({ onFeedGenerated }: { onFeedGenerated: (glances: string[]) => void }) {
  const [state, formAction] = useFormState(getPersonalizedFeed, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === 'success' && state.glances) {
        onFeedGenerated(state.glances);
        toast({
            title: "Success!",
            description: "Your personalized feed has been generated.",
        });
    } else if (state.message && state.message !== 'Validation failed' && state.message !== 'success') {
        toast({
            title: "Error",
            description: state.message,
            variant: "destructive",
        });
    }
  }, [state, onFeedGenerated, toast]);

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Welcome to Glance AI!</CardTitle>
        <CardDescription>
          Let&apos;s personalize your feed. Tell us what you&apos;re interested in, and our AI will curate some Glances just for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Textarea
            name="interests"
            placeholder="e.g., 'I love hiking in the mountains, trying new coffee shops, and coding with React...'"
            rows={4}
            required
          />
          <SubmitButton />
          {state.errors?.interests && (
            <p className="text-sm font-medium text-destructive">
              {state.errors.interests.join(', ')}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
