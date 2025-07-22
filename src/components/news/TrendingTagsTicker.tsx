import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface TrendingTagsTickerProps {
  tags: string[];
}

export default function TrendingTagsTicker({ tags }: TrendingTagsTickerProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Duplicate the tags to create a seamless looping effect animation
  const extendedTags = [...tags, ...tags];

  return (
    <div className="relative w-full overflow-hidden bg-secondary/50 rounded-lg p-2 group">
      <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-background to-transparent z-10"></div>
      <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-background to-transparent z-10"></div>
      <div className="whitespace-nowrap group-hover:[animation-play-state:paused]">
        <div className="inline-block animate-marquee">
          {extendedTags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-sm mx-2 bg-card cursor-pointer hover:bg-accent/20 transition-colors">
              <Tag className="w-3 h-3 mr-1.5 text-primary" />
              {tag}
            </Badge>
          ))}
        </div>
        <div className="inline-block animate-marquee">
          {extendedTags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-sm mx-2 bg-card cursor-pointer hover:bg-accent/20 transition-colors">
              <Tag className="w-3 h-3 mr-1.5 text-primary" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
