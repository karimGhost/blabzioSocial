import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Video, Image as ImageIcon } from 'lucide-react';
import { type Post } from '@/lib/types';

interface ArticleCardProps {
  post: Post;
}

const ArticleIcon = ({ type }: { type: Post['type'] }) => {
  switch (type) {
    case 'video':
      return <Video className="w-4 h-4 text-muted-foreground" />;
    case 'image':
      return <ImageIcon className="w-4 h-4 text-muted-foreground" />;
    default:
      return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
  }
};

export default function ArticleCard({ post }: ArticleCardProps) {
  return (
    <Link href={`/article/${post.id}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1 border-2 border-transparent hover:border-primary/50">
        {post.type === 'image' && post.mediaUrl && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <Image
              src={post.mediaUrl}
              alt={post.title}
              width={600}
              height={400}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="news article"
            />
          </div>
        )}
        <CardHeader>
          <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
          <CardTitle className="font-headline text-lg md:text-xl leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
          <div className="flex items-center pt-2 text-sm text-muted-foreground">
            <Avatar className="w-6 h-6 mr-2">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{post.author.name}</span>
            <span className="mx-2">·</span>
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground line-clamp-3">{post.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <ArticleIcon type={post.type} />
        </CardFooter>
      </Card>
    </Link>
  );
}
