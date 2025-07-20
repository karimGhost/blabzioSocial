import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/News" className="text-2xl font-headline font-bold text-primary hover:text-accent transition-colors">
          News
        </Link>
        <nav>
          <Button asChild>
            <Link href="/contribute">
              <PlusCircle className="mr-2 h-4 w-4" />
              Contribute
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
