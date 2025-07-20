import Header from '@/components/layout/Header';
import ContributeForm from '@/components/contribution/ContributeForm';

export default function ContributePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl font-bold text-foreground">
              Create a New Post
            </h1>
            <p className="text-muted-foreground mt-2">
              Share your story with the world. Fill out the details below to publish your article.
            </p>
          </div>
          <ContributeForm />
        </div>
      </main>
    </div>
  );
}
