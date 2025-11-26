import { contentPosts } from '@/lib/data';
import ModerationCard from '@/components/content/moderation-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContentPage() {
  const pendingPosts = contentPosts.filter(p => p.status === 'Pending');
  const approvedPosts = contentPosts.filter(p => p.status === 'Approved');
  const rejectedPosts = contentPosts.filter(p => p.status === 'Rejected');

  return (
    <Tabs defaultValue="pending">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-headline">Content Moderation</h2>
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingPosts.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="pending">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingPosts.length > 0 ? (
            pendingPosts.map(post => <ModerationCard key={post.id} post={post} />)
          ) : (
            <p className="text-muted-foreground col-span-full text-center">No pending content to review.</p>
          )}
        </div>
      </TabsContent>
      <TabsContent value="approved">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {approvedPosts.length > 0 ? (
            approvedPosts.map(post => <ModerationCard key={post.id} post={post} />)
          ) : (
            <p className="text-muted-foreground col-span-full text-center">No approved content yet.</p>
          )}
        </div>
      </TabsContent>
      <TabsContent value="rejected">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rejectedPosts.length > 0 ? (
            rejectedPosts.map(post => <ModerationCard key={post.id} post={post} />)
          ) : (
            <p className="text-muted-foreground col-span-full text-center">No rejected content.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
