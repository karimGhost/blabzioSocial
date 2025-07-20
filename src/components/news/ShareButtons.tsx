'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Rss } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [canShare, setCanShare] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (navigator.share) {
      setCanShare(true);
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article on CitrusPress: ${title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
          variant: "destructive",
          title: "Sharing failed",
          description: "Could not share the article at this time.",
        });
      }
    }
  };

  const handleShareToFeed = () => {
    toast({
      title: "Feature coming soon!",
      description: "Sharing to the feed will be available in a future update.",
    });
  };

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm font-semibold text-muted-foreground">Share this article:</p>
      <Button variant="outline" size="icon" onClick={handleShareToFeed}>
        <Rss className="h-5 w-5" />
        <span className="sr-only">Share to Feed</span>
      </Button>
      {canShare && (
        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
          <span className="sr-only">Share externally</span>
        </Button>
      )}
    </div>
  );
}
