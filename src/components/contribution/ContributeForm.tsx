'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateTagsForArticle,publishArticle } from '@/app/(app)/contribute/actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Wand2, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long.' }),
  content: z.string().min(50, { message: 'Content must be at least 50 characters long.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }).optional().or(z.literal('')),
  videoUrl: z.string().url({ message: 'Please enter a valid video URL.' }).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContributeForm() {
  const { toast } = useToast();
  const route = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      imageUrl: '',
      videoUrl: '',
    },
  });

  const handleGenerateTags = async () => {
    const content = form.getValues('content');
    if (!content || content.length < 50) {
      toast({
        variant: 'destructive',
        title: 'Content too short',
        description: 'Please write at least 50 characters before generating tags.',
      });
      return;
    }
    setIsGeneratingTags(true);
    const result = await generateTagsForArticle(content);
    setIsGeneratingTags(false);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else if (result.tags) {
      setTags(Array.from(new Set([...tags, ...result.tags])));
      toast({ title: 'Success', description: 'tags have been added.' });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const articleData = { ...values, tags };
    const result = await publishArticle(articleData);

    if (result.success) {
      toast({
        title: 'Article Published!',
        description: result.message,
      });
      form.reset();
      setTags([]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Publication Failed',
        description: result.message,
      });
    }
    setIsSubmitting(false);
    // route.push("/News")
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-6 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Future of Renewable Energy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea rows={10} placeholder="Write your article here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/embed/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex items-start gap-4">
                <div className="flex-grow space-y-2">
                  <div className="flex flex-wrap gap-2 p-3 min-h-[40px] rounded-md border border-input">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1.5 rounded-full hover:bg-destructive/20 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground px-1">Generate tags from your content.</p>
                    )}
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={handleGenerateTags} disabled={isGeneratingTags}>
                  {isGeneratingTags ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate 
                </Button>
              </div>
            </FormItem>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Article
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
