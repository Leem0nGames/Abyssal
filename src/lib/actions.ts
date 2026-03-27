'use server';

import { generateLoreSnippet } from '@/ai/flows/generate-lore-snippet-flow';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const loreSchema = z.object({
  keywords: z.string().min(3, 'Keywords must be at least 3 characters long.'),
  theme: z.string().min(1, 'Please select a theme.'),
});

export async function getLoreSnippet(prevState: any, formData: FormData) {
  const validatedFields = loreSchema.safeParse({
    keywords: formData.get('keywords'),
    theme: formData.get('theme'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the errors below.',
    };
  }
  
  try {
    const result = await generateLoreSnippet({
      keywords: validatedFields.data.keywords,
      theme: validatedFields.data.theme,
    });
    return { type: 'success', data: result };
  } catch (error) {
    return {
      type: 'error',
      message: 'Failed to generate lore. The ancient spirits are displeased.',
    };
  }
}

// Mock authentication actions
export async function loginAction() {
  redirect('/dashboard');
}

export async function signupAction() {
  redirect('/dashboard');
}
