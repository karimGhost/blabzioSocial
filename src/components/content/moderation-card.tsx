'use client';

import Image from 'next/image';
import { ContentPost } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Facebook, Twitter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function PlatformIcon({ platform }: { platform: ContentPost['platform']}) {
  const className = "h-5 w-5 text-muted-foreground";
  if (platform === 'Facebook') return <Facebook className={className} />;
  if (platform === 'Twitter') return <Twitter className={className} />;
  // Fallback for Instagram
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>;
}

export default function ModerationCard({ post }: { post: ContentPost }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <Avatar>
          <AvatarImage src={post.author.avatar} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-base">{post.author.name}</CardTitle>
          <time className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
          </time>
        </div>
        <PlatformIcon platform={post.platform} />
      </CardHeader>
      <CardContent className="flex-1">
        <p className="mb-4">{post.content}</p>
        {post.mediaUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.mediaUrl}
              alt="Post media"
              fill
              className="object-cover"
              data-ai-hint="social media post"
            />
          </div>
        )}
      </CardContent>
      {post.status === 'Pending' && (
        <CardFooter style={{justifyContent:"center"}} className="flex center justify-end gap-2">
          <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <X className="-mr-1 h-4 w-4" /> Reject
          </Button>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-400">
            <Check className="-mr-1 h-4 w-4" />Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
