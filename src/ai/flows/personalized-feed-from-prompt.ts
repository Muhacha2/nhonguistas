// src/ai/flows/personalized-feed-from-prompt.ts
'use server';

/**
 * @fileOverview Generates a personalized feed of Glances based on a user-provided text prompt describing their interests.
 *
 * - generatePersonalizedFeed - A function that generates a personalized feed of Glances.
 * - GeneratePersonalizedFeedInput - The input type for the generatePersonalizedFeed function.
 * - GeneratePersonalizedFeedOutput - The return type for the generatePersonalizedFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedFeedInputSchema = z.object({
  interestsPrompt: z
    .string()
    .describe(
      'A text prompt describing the user\u2019s interests, which will inform the type of Glances in the feed.'
    ),
});
export type GeneratePersonalizedFeedInput = z.infer<
  typeof GeneratePersonalizedFeedInputSchema
>;

const GeneratePersonalizedFeedOutputSchema = z.object({
  glances: z
    .array(z.string())
    .describe(
      'A list of Glances, where each Glance is a string representing the content of the Glance.'
    ),
});
export type GeneratePersonalizedFeedOutput = z.infer<
  typeof GeneratePersonalizedFeedOutputSchema
>;

export async function generatePersonalizedFeed(
  input: GeneratePersonalizedFeedInput
): Promise<GeneratePersonalizedFeedOutput> {
  return generatePersonalizedFeedFlow(input);
}

const personalizedFeedPrompt = ai.definePrompt({
  name: 'personalizedFeedPrompt',
  input: {schema: GeneratePersonalizedFeedInputSchema},
  output: {schema: GeneratePersonalizedFeedOutputSchema},
  prompt: `You are an AI assistant designed to curate a personalized feed of \"Glances\" for new users based on their stated interests. Glances are short, engaging content snippets, similar to posts on a social media feed.

The user will provide a text prompt describing their interests. Your task is to generate a list of Glances that align with those interests. Each Glance should be a short string, no more than 280 characters.

User Interests: {{{interestsPrompt}}}

Here are some example Glances:
- \"Just finished an amazing hike in the Rockies! #hiking #mountains #nature\"
- \"Coding late into the night. Solving complex problems is so satisfying! #coding #softwareengineer #tech\"
- \"Trying out a new recipe for vegan lasagna. Smells delicious! #vegan #cooking #foodie\"

Now, generate a list of Glances that would be relevant to the user's interests.  The list should be relatively diverse, even if the interests prompt is narrow.  Do not include any hashtags unless they are relevant to the content.  The user is new, so make the Glances relevant to onboarding the user to the platform.

Output the glances in JSON format.`,
});

const generatePersonalizedFeedFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedFeedFlow',
    inputSchema: GeneratePersonalizedFeedInputSchema,
    outputSchema: GeneratePersonalizedFeedOutputSchema,
  },
  async input => {
    const {output} = await personalizedFeedPrompt(input);
    return output!;
  }
);
