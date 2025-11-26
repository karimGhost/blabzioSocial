'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Clock, Facebook, Twitter } from 'lucide-react';
import { format } from 'date-fns';
import { scheduledPosts } from '@/lib/data';
import type { ScheduledPost } from '@/lib/types';
// import ContentSuggestions from '@/components/ai/content-suggestions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function PlatformIcon({ platform }: { platform: ScheduledPost['platform']}) {
  const className = "h-5 w-5 text-primary";
  if (platform === 'Facebook') return <Facebook className={className} />;
  if (platform === 'Twitter') return <Twitter className={className} />;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>;
}


export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [postContent, setPostContent] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Create a new post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[150px] text-base"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Select defaultValue="Twitter">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full sm:w-[280px] justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP HH:mm') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  <div className="p-3 border-t border-border">
                    <Input type="time" defaultValue={format(date || new Date(), 'HH:mm')} />
                  </div>
                </PopoverContent>
              </Popover>
              <Button className="w-full sm:w-auto sm:ml-auto">Schedule Post</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                   <PlatformIcon platform={post.platform} />
                  <div className="flex-1">
                    <p className="text-sm">{post.content}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(post.scheduledTime, 'MMM d, yyyy @ p')}</span>
                    </div>
                  </div>
                  <Badge variant={post.status === 'Error' ? 'destructive' : 'secondary'}>{post.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        {/* <ContentSuggestions onSelectSuggestion={setPostContent} /> */}
      </div>
    </div>
  );
}
