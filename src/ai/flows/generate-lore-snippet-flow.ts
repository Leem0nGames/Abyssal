'use server';
/**
 * @fileOverview An AI agent that generates dark fantasy lore snippets or character backstories.
 *
 * - generateLoreSnippet - A function that handles the lore snippet generation process.
 * - GenerateLoreSnippetInput - The input type for the generateLoreSnippet function.
 * - GenerateLoreSnippetOutput - The return type for the generateLoreSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLoreSnippetInputSchema = z.object({
  keywords: z
    .string()
    .describe(
      'A comma-separated string of keywords that should be incorporated into the lore snippet.'
    ),
  theme: z
    .string()
    .describe(
      'An overarching dark fantasy theme or mood for the lore snippet (e.g., "despair", "ancient evil", "corrupted magic").'
    ),
});
export type GenerateLoreSnippetInput = z.infer<typeof GenerateLoreSnippetInputSchema>;

const GenerateLoreSnippetOutputSchema = z.object({
  title: z
    .string()
    .describe('A thematic title for the generated lore snippet or backstory.'),
  lore: z
    .string()
    .describe('The generated dark fantasy lore snippet or character backstory.'),
});
export type GenerateLoreSnippetOutput = z.infer<typeof GenerateLoreSnippetOutputSchema>;

export async function generateLoreSnippet(
  input: GenerateLoreSnippetInput
): Promise<GenerateLoreSnippetOutput> {
  return generateLoreSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLoreSnippetPrompt',
  input: {schema: GenerateLoreSnippetInputSchema},
  output: {schema: GenerateLoreSnippetOutputSchema},
  prompt: `You are a master loremaster for a dark fantasy MMORPG called "Abyssal Conclave". Your task is to craft a captivating and dark lore snippet or character backstory.

Craft a short, evocative piece of lore or a character backstory (around 150-250 words) that fits the dark fantasy aesthetic. Ensure it incorporates the provided keywords and adheres to the specified theme. The output should be both mysterious and intriguing, suitable for inspiring player profiles or forum discussions.

Keywords: {{{keywords}}}
Theme: {{{theme}}}`,
});

const generateLoreSnippetFlow = ai.defineFlow(
  {
    name: 'generateLoreSnippetFlow',
    inputSchema: GenerateLoreSnippetInputSchema,
    outputSchema: GenerateLoreSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
