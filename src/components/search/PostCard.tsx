"use client";
import { Card } from "@/components/ui/card";

export default function PostCard({ post }: { post: any }) {
  return (
    <Card className="p-4">
      <p className="font-semibold">{post?.user?.name || "User"}</p>
      <p className="text-muted-foreground text-sm mt-1">{post?.content || "Post content..."}</p>
    </Card>
  );
}
