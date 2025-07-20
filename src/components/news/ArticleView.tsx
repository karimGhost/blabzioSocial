import Image from 'next/image';
import { format } from 'date-fns';
import { type Post } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ShareButtons from './ShareButtons';

interface ArticleViewProps {
  post: Post;
}

export default function ArticleView({ post }: ArticleViewProps) {
  return (
    <article className="container mx-auto px-4 max-w-4xl">
      <header className="mb-8">
        <Badge variant="secondary" className="mb-4">{post.category}</Badge>
        <h1 className="font-headline text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center text-muted-foreground">
          <Avatar className="w-10 h-10 mr-4">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{post.author.name}</p>
            <p className="text-sm">
              Published on {format(new Date(post.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </header>

      {post.type === 'image' && post.mediaUrl && (
        <div className="my-8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.mediaUrl}
            alt={post.title}
            width={1200}
            height={675}
            className="w-full h-auto object-cover"
            priority
            data-ai-hint="news article detail"
          />
        </div>
      )}

      {post.type === 'video' && post.mediaUrl && (
        <div className="my-8 aspect-video">
          <iframe
            className="w-full h-full rounded-lg shadow-lg"
            src={post.mediaUrl}
            title={post.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground prose-p:text-foreground/80 prose-headings:text-foreground prose-strong:text-foreground">
        <p className="lead">{post.content.split('. ')[0]}.</p>
        <p>{post.content.substring(post.content.split('. ')[0].length + 1)}</p>
      </div>

      <footer className="mt-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-base">
              # {tag}
            </Badge>
          ))}
        </div>
        <ShareButtons title={post.title} />
      </footer>
    </article>
  );
}
