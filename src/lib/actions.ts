
'use server';

import { generatePersonalizedFeed } from '@/ai/flows/personalized-feed-from-prompt';
import { suggestTrendHashtags } from '@/ai/flows/suggest-trend-hashtags';
import { z } from 'zod';

const interestsSchema = z.object({
  interests: z.string().min(10, "Please describe your interests in a bit more detail."),
});

export async function getPersonalizedFeed(prevState: any, formData: FormData) {
  const validatedFields = interestsSchema.safeParse({
    interests: formData.get('interests'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generatePersonalizedFeed({ interestsPrompt: validatedFields.data.interests });
    // In a real app, you would save these glances or associate them with the user
    return {
      message: 'success',
      glances: result.glances,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An error occurred while generating your feed.',
    };
  }
}

export async function getHashtagSuggestions(mediaDataUri: string) {
  // This function is now called from the client-side, 
  // but the 'use server' directive at the top of the file ensures it still runs on the server.
  if (!mediaDataUri) {
    return {
      error: 'Media data is required.',
    };
  }

  try {
    const result = await suggestTrendHashtags({ mediaDataUri });
    return {
      hashtags: result.hashtags,
    };
  } catch (error: any) {
    console.error("AI Hashtag suggestion failed:", error.message);
    // Provide a more specific error if billing is likely the issue.
    if (error.message?.includes('Billing')) {
       return {
         error: 'AI suggestions require billing to be enabled on your Google Cloud project.',
       };
    }
    return {
      error: 'Failed to get hashtag suggestions.',
    };
  }
}
