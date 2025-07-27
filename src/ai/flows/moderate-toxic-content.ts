'use server';

/**
 * @fileOverview A content moderation AI agent that flags toxic content in articles and comments.
 *
 * - moderateText - A function that moderates the given text.
 * - ModerateTextInput - The input type for the moderateText function.
 * - ModerateTextOutput - The return type for the moderateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateTextInputSchema = z.object({
  text: z.string().describe('The text to be moderated.'),
});
export type ModerateTextInput = z.infer<typeof ModerateTextInputSchema>;

const ModerateTextOutputSchema = z.object({
  isToxic: z.boolean().describe('Whether the text is toxic or not.'),
  toxicityReason: z
    .string()
    .optional()
    .describe('The reason why the text is considered toxic.'),
});
export type ModerateTextOutput = z.infer<typeof ModerateTextOutputSchema>;

export async function moderateText(input: ModerateTextInput): Promise<ModerateTextOutput> {
  return moderateTextFlow(input);
}

const moderateTextPrompt = ai.definePrompt({
  name: 'moderateTextPrompt',
  input: {schema: ModerateTextInputSchema},
  output: {schema: ModerateTextOutputSchema},
  prompt: `You are a content moderation AI.

You will determine whether the given text is toxic or not.

If the text is toxic, set the isToxic field to true and provide a reason in the toxicityReason field.
If the text is not toxic, set the isToxic field to false and leave the toxicityReason field empty.

Text: {{{text}}}`,
});

const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: ModerateTextInputSchema,
    outputSchema: ModerateTextOutputSchema,
  },
  async input => {
    const {output} = await moderateTextPrompt(input);
    return output!;
  }
);
