import { getPostById } from '@/lib/data';
import Header from '@/components/layout/Header';
import ArticleView from '@/components/news/ArticleView';
import { notFound } from 'next/navigation';

interface ArticlePageProps {
  params: {
    id: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const post = getPostById(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-8">
        <ArticleView post={post} />
      </main>
    </div>
  );
}
