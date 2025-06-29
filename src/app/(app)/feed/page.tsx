"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, getDocs, getDoc, doc } from "firebase/firestore";
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
  isPremium:boolean;
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
      // 1. Get blocked + following
      const [blockedSnap, followingSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "blocked")),
        getDocs(collection(db, "users", user.uid, "followers")),
      ]);

      const blockedUids = blockedSnap.docs.map(doc => doc.id);
      const followingUids = followingSnap.docs.map(doc => doc.id);

      // 2. Get posts
      const postsRef = collection(dbb, "posts");
      const q = query(postsRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const rawPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];

        // 3. Get unique author UIDs
        const authorUids = Array.from(new Set(
          rawPosts.map(post => post.author?.uid).filter(Boolean)
        ));

        // 4. Fetch author privacy + premium status
        const authorDocs = await Promise.all(
          authorUids.map(uid => getDoc(doc(db, "users", uid  )) )
        );

        const authorMap: Record<
          string,
          { isPrivate: boolean; isPremium: boolean }
        > = {};

        authorDocs.forEach(doc => {
          if (doc.exists()) {
            const data = doc.data();
            authorMap[doc.id] = {
              isPrivate: data.isPrivate ?? false,
              isPremium: data.isPremium ?? false,
            };
          }
        });

        // 5. Filter & enrich posts
        const visiblePosts = rawPosts
          .filter(post => {
            const authorId = post.author?.uid;
            if (!authorId) return false;

            // Hide blocked authors
            if (blockedUids.includes(authorId)) return false;

            // Show public posts
            const isPrivate = authorMap[authorId]?.isPrivate;
            if (!isPrivate) return true;

            // Show private only if followed
            return followingUids.includes(authorId);
          })
          .map(post => {
            const authorId = post.author?.uid;
            const isPremium = authorMap[authorId]?.isPremium ?? false;

            return {
              ...post,
              id: post.id,
              author: {
                ...post.author,
                isPremium, // ✅ Add this from user doc
              },
            };
          });

        setPosts(visiblePosts);
        console.log("isPremium",visiblePosts )
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading posts:", error);
      setLoading(false);
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
