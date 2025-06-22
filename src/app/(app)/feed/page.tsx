"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { dbb , db} from "@/lib/firebase"; // your Firestore instance
import { PostItem } from "@/components/feed/post-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Video as VideoIcon, Smile } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
export default function FeedPage() {
  const router = useRouter();
const {user,userData} = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  type Post = {
  id: string;
  author: {
    uid: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt?: number;
  [key: string]: any; // for other possible dynamic fields
};

useEffect(() => {
  if (!user) return;

  const fetchBlockedAndPosts = async () => {
    try {
      const blockedSnapshot = await getDocs(
        collection(db, "users", user.uid, "blocked")
      );

      const blockedUids = blockedSnapshot.docs.map(doc => doc.id);

      const postsRef = collection(dbb, "posts");
      const q = query(postsRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const postsData = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as Post))
            .filter((post) => !blockedUids.includes(post.author?.uid));

          setPosts(postsData);
          setLoading(false);
        },
        (error) => {
          console.error("Failed to fetch posts:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading blocked users or posts:", error);
    }
  };

  fetchBlockedAndPosts();
}, [user]);



  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Create Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={userData?.avatarUrl}
                alt={userData?.fullName}
                data-ai-hint="profile avatar"
              />
              <AvatarFallback>{userData?.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <Input
            placeholder={`What's on your mind, ${userData?.fullName} ?`}
              className="flex-1 rounded-full bg-muted border-transparent focus-visible:ring-primary focus-visible:ring-2"
              onClick={() => {
                router.push("/create-post");
              }}
              readOnly
            />
          </div>
          <div className="flex justify-around pt-2 border-t">
            <Button variant="ghost" className="text-muted-foreground" asChild>
              <Link href="/create-post" className="text-smLogo">
                <ImageIcon className="h-5 w-5 mr-2 text-green-500 text-smLogo " /> Photo/Video
    </Link>
  </Button>
            <Button variant="ghost" className="text-muted-foreground" asChild>
                <Link href="/videos/record" className="text-smLogo">

                <VideoIcon className="h-5 w-5 mr-2 text-blue-500" />  Video
    </Link>
  </Button>
            <Button variant="ghost" className="text-muted-foreground" asChild>
              <Link href="/create-post" className="text-smLogo">
                <Smile className="h-5 w-5 mr-2 text-yellow-500" /> Feeling/Activity
    </Link>
  </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map((post) => (<PostItem  key={post.id} post={post} />))
      )}
    </div>
  );
}
