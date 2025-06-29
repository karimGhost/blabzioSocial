"use client";

import { useEffect, useState } from "react";
import { dbb, db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from "lucide-react";
import { doc, collection, deleteDoc, setDoc, addDoc, query, onSnapshot, getDoc, orderBy,where, increment, updateDoc,  getDocs} from "firebase/firestore";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import {  Facebook, Twitter,  CopyCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import ShareDropdown from "@/components/shareDropdown";
import { ProfileBadge } from "@/components/profile/ProfileBadge";
import { formatDistanceToNow } from "date-fns";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // or next/router if using older Next.js


interface Comment {
  id: string;
  uid: string;
  text: string;
  timestamp: number;
  author: {
    name: string;
    avatarUrl: string;
  };
}

interface Reply {
  id: string;
  uid: string;
  text: string;
  timestamp: number;
  name: string;
  avatarUrl: string;
}

interface LikeUser {
  uid: string;
  name: string;
  timestamp: number;
  avatarUrl?: string;
}

interface RepliesListProps {
  postId: string;
  commentId: string;
}



function RepliesList({ postId, commentId }: RepliesListProps) {
  const [replies, setReplies] = useState<Reply[]>([]);
 const { user, userData } = useAuth();
  useEffect(() => {
    const repliesRef = collection(dbb, "posts", postId, "comments", commentId, "replies");
    const q = query(repliesRef, orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Reply));
      setReplies(items);
    });
    return () => unsub();
  }, [postId, commentId]);

  if (!replies.length) return null;

  return (
    <div className="pl-10 space-y-1">
      {replies.map((reply) => (
        <div key={reply.id} className="flex gap-2 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarImage src={reply.avatarUrl} />
            <AvatarFallback>{reply.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-xs">{reply.name}</p>
            <p className="text-xs">{reply.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PostPage() {

 const {user, userData} = useAuth()
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
const router = useRouter();
const {toast} = useToast();



  const { id } = useParams();
  const [post, setPost] = useState<any>(null);



    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/feed/${post?.id}`
  const shareText = encodeURIComponent("Check out this post!")

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${shareUrl}`,
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
  }

const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likesCount);
  const [likedUsers, setLikedUsers] = useState<LikeUser[]>([]);



   useEffect(() => {
      if (!post?.id || !user?.uid) return;
  
      const likesRef = collection(dbb, "posts", post.id, "likes");
      const unsub = onSnapshot(likesRef, (snapshot) => {
        const users = snapshot.docs.map((doc) => doc.data() as LikeUser);
        setLikedUsers(users);
        setIsLiked(users.some((u) => u.uid === user.uid));
      });
  
      return () => unsub();
    }, [post?.id, user?.uid]);
    
  useEffect(() => {
    if (!post?.id) return;

    const commentsRef = collection(dbb, "posts", post?.id, "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(items);
            console.log("items", items);

    });

    return () => unsub();
  }, [post?.id]);


  const handleLike = async () => {
    if (!user || !post?.id) return;

    const postRef = doc(dbb, "posts", post.id);
    const likeRef = doc(dbb, "posts", post.id, "likes", user.uid);

    try {
      const snap = await getDoc(likeRef);

      if (snap.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
      } else {
        await setDoc(likeRef, {
          uid: user.uid,
          name: userData.fullName  || post.author.name,
          timestamp: Date.now(),
        });
        await updateDoc(postRef, { likesCount: increment(1) });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

useEffect(() => {
  if (!id) return;

  const fetchPost = async () => {
    const postRef = doc(dbb, "posts", id as string);
    const snap = await getDoc(postRef);

    if (snap.exists()) {
      const postWithId = { id: snap.id, ...snap.data() };
      setPost(postWithId);
      console.log("post is", postWithId);
    }
  };

  fetchPost();
}, [id]);

  
  const handleCommentSubmit = async () => {
    if (!user || !commentText.trim()) return;

    try {
      await addDoc(collection(dbb, "posts", post.id, "comments"), {
        uid: user.uid,
        text: commentText.trim(),
        timestamp: Date.now(),
        author: {
          name: userData.fullName || "Anonymous",
          avatarUrl: userData?.avatarUrl || "",
        },
      });
      setCommentText("");
    } catch (err) {
      console.error("Failed to send comment:", err);
    }
  };

  const handleReplySubmit = async (commentId: string, reply: string) => {
    if (!user || !reply?.trim()) return;

    const newReply = {
      uid: user.uid,
      text: reply.trim(),
      timestamp: Date.now(),
      name: userData.fullName || "",
      avatarUrl: userData.avatarUrl || "",
    };

    await addDoc(collection(dbb, "posts", post.id, "comments", commentId, "replies"), newReply);

    setReplyMap((prev) => ({ ...prev, [commentId]: "" }));
  };


  const handleSendMessage = (post: any) => {
  router.push(`/messages/new?postId=${post.id}`);
};

const handleMuteUser = async (username: string) => {
  if (!user) return;
  try {
    await setDoc(doc(db, "users", user.uid, "muted", username), { mutedAt: Date.now() });
    alert(`${username} has been muted.`);
  } catch (err) {
    console.error("Mute failed:", err);
  }
};

const handleBlockUser = async (username: string) => {
  if (!user) return;
  try {
    await setDoc(doc(dbb, "users", user.uid, "blocked", username), { blockedAt: Date.now() });
    alert(`${username} has been blocked.`);
  } catch (err) {
    console.error("Block failed:", err);
  }
};



 useEffect(() => {
    if (!post?.id) return;

    const commentsRef = collection(dbb, "posts", post.id, "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(items);
    });

    return () => unsub();
  }, [post?.id]);
const handleReportPost = async (id: any) => {
  if (!user) return;
  try {
    await addDoc(collection(dbb, "reports"), {
      postId: post.id,
      reporterId: user.uid,
      reportedAt: Date.now(),
      reason: "Inappropriate content", // Or ask user for reason
    });
    alert("Post reported. Thanks for your feedback.");
  } catch (err) {
    console.error("Report failed:", err);
  }
};

  if (!post) return <p>Loading...</p>;
    const timeAgo = post?.timestamp ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true }) : "";

  function handleShareToFeed(post: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Link href={`/profile/${post.author.name}`}>
          <Avatar className="h-11 w-11 border-2 border-primary">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="grid gap-0.5">
          <span>
  <Link href={`/profile/${post.author.name}`} className="font-semibold hover:underline">
            {post.author.name}

          </Link>

   <span className="flex">
                          <h1 className="text-2xl sm:text-3xl font-bold font-headline">{userData?.fullName}  </h1> 

              <ProfileBadge/>
            </span>
                        
          </span>
        



          <span className="text-xs text-muted-foreground">
            @{post.author.name} · {timeAgo}
          </span>
        </div>
      <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
      <MoreHorizontal className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
 


    <DropdownMenuItem onClick={() => handleShareToFeed(post)}>
      Share to Feed
    </DropdownMenuItem>
  
    {post?.author.uid !== user?.uid &&
<>
    <DropdownMenuItem onClick={() => handleSendMessage(post)}>
      Send in Message
    </DropdownMenuItem>

    <DropdownMenuItem onClick={() => handleMuteUser(post.author.name)}>
  Mute @{post.author.name}
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleBlockUser(post.author.name)}>
  Block @{post.author.name}
</DropdownMenuItem>
    <DropdownMenuItem
      className="text-destructive"
      onClick={() => handleReportPost(post?.id)}
    >
      Report Post
    </DropdownMenuItem>
    </>
    }
  </DropdownMenuContent>
</DropdownMenu>

      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        {post.mediaUrl && post.mediaType === "image" && (
          <div className="mt-3 h-64 -mx-4 sm:mx-0 sm:rounded-lg overflow-hidden aspect-video relative">
            <Image src={post.mediaUrl} alt="Post media" fill className="object-cover" />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 p-4 pt-0">
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <span>{post?.likesCount} Likes</span>
          <span>{comments.length} Comments · {comments?.length} Shares</span>
        </div>
        <Separator />
        <div className="grid w-full grid-cols-3 gap-1">
          <Button variant="ghost" onClick={handleLike} className={`flex items-center gap-1.5 ${isLiked ? 'text-destructive' : 'text-muted-foreground'}`}>
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-destructive' : ''}`} /> Like
          </Button>
          <Button variant="ghost" onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-muted-foreground">
            <MessageCircle className="h-5 w-5" /> Comment
          </Button>
           <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1.5 text-muted-foreground">
          <Share2 className="h-5 w-5" /> Share
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => window.open(socialLinks.facebook, "_blank")}>
          <Facebook className="mr-2 h-4 w-4 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(socialLinks.twitter, "_blank")}>
          <Twitter className="mr-2 h-4 w-4 text-sky-500" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(socialLinks.whatsapp, "_blank")}>
          <Send className="mr-2 h-4 w-4 text-green-500" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(socialLinks.telegram, "_blank")}>
          <Send className="mr-2 h-4 w-4 text-blue-400" />
          Telegram
        </DropdownMenuItem>
           <ShareDropdown  shareUrl={shareUrl}/>
      
      </DropdownMenuContent>
    </DropdownMenu>
        </div>

        {showComments && (
          <div className="w-full space-y-3">
            <Separator />

            {comments.length === 0 && (
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                No comments yet. Be the first to comment!
              </div>
            )}

            {comments.map((comment) => (
              <div key={comment.id} className="space-y-1">
                <div className="flex gap-2 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment?.author?.avatarUrl} />
                    <AvatarFallback>{comment?.author?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{comment?.author?.name}</p>
                    <p>{comment?.text}</p>
                  </div>
                </div>

                <RepliesList postId={post.id} commentId={comment.id} />

                <div className="pl-10">
                  <input
                    value={replyMap[comment.id] || ""}
                    onChange={(e) => setReplyMap((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="w-full px-2 py-1 text-sm border rounded"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleReplySubmit(comment.id, replyMap[comment.id]);
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="flex w-full items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData?.avatarUrl} alt="Current user" />
                <AvatarFallback>{userData?.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="h-10 min-h-[40px] flex-1 resize-none"
              />
              <Button size="icon" variant="ghost" disabled={!commentText.trim()} onClick={handleCommentSubmit}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
