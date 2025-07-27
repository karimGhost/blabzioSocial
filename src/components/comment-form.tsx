"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { moderateText } from "@/ai/flows/moderate-toxic-content";
import { Send } from "lucide-react";

const formSchema = z.object({
  comment: z.string().min(1, "Comment cannot be empty.").max(500, "Comment is too long."),
});

export function CommentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const moderationResult = await moderateText({ text: values.comment });

      if (moderationResult.isToxic) {
        toast({
          variant: "destructive",
          title: "Toxic Content Detected",
          description: moderationResult.toxicityReason || "Your comment violates our community guidelines and was not posted.",
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Comment Posted!",
        description: "Your comment has been successfully posted.",
      });
      form.reset();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not post your comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : <>Post Comment <Send className="ml-2 h-4 w-4" /></>}
        </Button>
      </form>
    </Form>
  );
}
