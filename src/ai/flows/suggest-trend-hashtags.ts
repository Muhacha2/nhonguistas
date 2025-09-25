// Implemented by the Assistant
'use server';
/**
 * @fileOverview Analyzes user-uploaded media and suggests relevant trending hashtags.
 *
 * - suggestTrendHashtags - A function that suggests trending hashtags for user-uploaded media.
 * - SuggestTrendHashtagsInput - The input type for the suggestTrendHashtags function.
 * - SuggestTrendHashtagsOutput - The return type for the suggestTrendHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrendHashtagsInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A photo or video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestTrendHashtagsInput = z.infer<typeof SuggestTrendHashtagsInputSchema>;

const SuggestTrendHashtagsOutputSchema = z.object({
  hashtags: z
    .array(z.string())
    .describe('An array of relevant trending hashtags for the media.'),
});
export type SuggestTrendHashtagsOutput = z.infer<typeof SuggestTrendHashtagsOutputSchema>;

export async function suggestTrendHashtags(
  input: SuggestTrendHashtagsInput
): Promise<SuggestTrendHashtagsOutput> {
  return suggestTrendHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrendHashtagsPrompt',
  input: {schema: SuggestTrendHashtagsInputSchema},
  output: {schema: SuggestTrendHashtagsOutputSchema},
  prompt: `You are an AI assistant designed to suggest trending hashtags for user-uploaded media.

  Analyze the following media and provide a list of relevant trending hashtags to increase its discoverability.

  Media: {{media url=mediaDataUri}}

  Consider current trends and the content of the media when suggesting hashtags.

  Return ONLY an array of relevant trending hashtags without any additional text or explanation.
  Do NOT include hashtags that are generic such as #photo or #video.
  The hashtags should be shorter than 30 characters.
  Response example: ["#haskell", "#functionalprogramming", "#fp"].`,
});

const suggestTrendHashtagsFlow = ai.defineFlow(
  {
    name: 'suggestTrendHashtagsFlow',
    inputSchema: SuggestTrendHashtagsInputSchema,
    outputSchema: SuggestTrendHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
