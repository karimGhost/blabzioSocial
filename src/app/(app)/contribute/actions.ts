'use server';

import { generateTags } from '@/ai/flows/generate-tags';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()),
});

export async function generateTagsForArticle(content: string): Promise<{ tags?: string[]; error?: string; }> {
  if (!content || content.trim().length < 50) {
    return { error: 'Please provide at least 50 characters of content to generate tags.' };
  }
  try {
    const result = await generateTags({ articleContent: content });
    return { tags: result.tags };
  } catch (error) {
    console.error('Error generating tags:', error);
    return { error: 'Failed to generate tags. Please try again.' };
  }
}

export async function publishArticle(data: unknown) : Promise<{ success: boolean; message: string; }> {
  const validation = articleSchema.safeParse(data);
  
  if (!validation.success) {
    return { success: false, message: 'Invalid article data.' };
  }

  // In a real application, you would save the data to a database here.
  console.log('Publishing article:', validation.data);

  return { success: true, message: 'Article published successfully!' };
}
