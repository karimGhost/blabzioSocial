import Link from 'next/link';
import { getPosts, getTrendingTags } from '@/lib/data';
import Header from '@/components/layout/Header';
import TrendingTagsTicker from '@/components/news/TrendingTagsTicker';
import ArticleCard from '@/components/news/ArticleCard';

export default function News() {
  const posts = getPosts();
  const trendingTags = getTrendingTags();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <TrendingTagsTicker tags={trendingTags} />
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-8 mt-6">
            Latest News
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Blabzio. All rights reserved.</p>
      </footer>
    </div>
  );
}
