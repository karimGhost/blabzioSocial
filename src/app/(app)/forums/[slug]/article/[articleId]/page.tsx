import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, Heart, Share2, MessageSquare } from "lucide-react";
import { CommentForm } from "@/components/comment-form";

const mockArticle = {
  id: "a2",
  title: "Best Practices for Server Components",
  content: `
Server Components are a new feature in React that allow you to write UI components that run on the server. This can have a number of benefits, including improved performance, better SEO, and reduced client-side JavaScript.

### Key Concepts

1.  **Zero Client-Side JavaScript:** By default, Server Components do not send any JavaScript to the client. This means that the initial page load is much faster, as the browser only needs to download and parse HTML and CSS.
2.  **Direct Data Fetching:** Server Components can fetch data directly from a database, file system, or API. This eliminates the need for client-side data fetching libraries and reduces the number of round trips between the client and server.
3.  **Security:** Because Server Components run on the server, they can safely access sensitive data and APIs without exposing them to the client.

### When to use Server Components?

- For static content that does not need to be interactive.
- For pages that need to be indexed by search engines.
- For components that need to access server-side data or APIs.

Client Components should be used for UI that is interactive and needs to respond to user input. You can mix and match Server and Client Components in the same application to get the best of both worlds.
  `,
  author: { id: "u3", name: "Jane Smith", avatarUrl: "https://placehold.co/100x100" },
  createdAt: "2 days ago",
  reactions: { likes: 256, hearts: 88 },
};

const mockComments = [
  { id: "c1", author: { name: "John Doe", avatarUrl: "https://placehold.co/100x100" }, text: "Great overview! This really clarifies when to use Server Components.", createdAt: "2 days ago" },
  { id: "c2", author: { name: "Ada Lovelace", avatarUrl: "https://placehold.co/100x100" }, text: "I've been using them in my latest project and the performance improvement is noticeable. Thanks for sharing!", createdAt: "1 day ago" },
  { id: "c3", author: { name: "Carlos Rossi", avatarUrl: "https://placehold.co/100x100" }, text: "Can you do a follow-up on streaming UI with Server Components?", createdAt: "1 day ago" },
];


export default function ArticlePage({ params }: { params: { slug: string, articleId: string } }) {
  const article = mockArticle;

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-4">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight lg:text-5xl">
          {article.title}
        </h1>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={article.author.avatarUrl} />
            <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{article.author.name}</p>
            <p className="text-sm text-muted-foreground">Posted {article.createdAt}</p>
          </div>
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <article className="prose dark:prose-invert prose-lg max-w-none">
        {article.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="font-headline">{paragraph.substring(4)}</h3>
            }
            return <p key={index}>{paragraph}</p>
        })}
      </article>

      <Separator className="my-8" />

      <div className="flex items-center space-x-4">
        <Button variant="outline">
          <ThumbsUp className="mr-2 h-4 w-4" /> {article.reactions.likes}
        </Button>
        <Button variant="outline">
          <Heart className="mr-2 h-4 w-4" /> {article.reactions.hearts}
        </Button>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </div>
      
      <Separator className="my-8" />

      <div>
        <h2 className="font-headline text-2xl font-bold mb-6 flex items-center">
            <MessageSquare className="mr-2 h-6 w-6"/> Comments ({mockComments.length})
        </h2>
        <div className="space-y-6 mb-8">
            {mockComments.map(comment => (
                <div key={comment.id} className="flex space-x-4">
                    <Avatar>
                        <AvatarImage src={comment.author.avatarUrl} />
                        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">{comment.createdAt}</p>
                        </div>
                        <p className="text-muted-foreground mt-1">{comment.text}</p>
                    </div>
                </div>
            ))}
        </div>
        <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-headline text-lg font-semibold mb-4">Join the discussion</h3>
            <CommentForm />
        </div>
      </div>

    </div>
  );
}
