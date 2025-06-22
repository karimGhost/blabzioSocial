"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Play, Facebook, Twitter, Send, MoreVertical,X, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import CommentsModal from "../CommentsModal";
import { useAuth } from "@/hooks/useAuth";
import { dbd } from "@/lib/firebase";
import { doc, collection, deleteDoc, setDoc, addDoc, query, onSnapshot, getDoc, orderBy,where, increment, updateDoc,  getDocs} from "firebase/firestore";
import { DropdownMenuContent,DropdownMenuTrigger, DropdownMenuItem, DropdownMenu } from "../ui/dropdown-menu";
import ShareDropdown from "../shareDropdown";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { deleteVideo } from "./api/deletevideo";

import { useRouter } from "next/navigation";
interface VideoUser {
  uid: string;
  name: string;
  username: string;
  avatarUrl: string;

}
interface VideoItemProps {
    containerWidth: number;

  video: {
    id: string;
    url: string;
    description: string;
    timestamp: any; // Firestore timestamp
    user: VideoUser;
    likesCount: number;
    commentsCount: number;

  };
}

export function VideoItem({ video, containerWidth}: VideoItemProps) {
  const {user, userData} = useAuth()
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount || 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
 const [commentcount, setCommentComunt] =  useState<number >()
const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/videos/${video.id}`
  const shareText = encodeURIComponent("Check out this post!")

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${shareUrl}`,
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
  }


 const handleLike = async () => {
  if (!user || !video?.id) return;

  const videoRef = doc(dbd, "videos", video.id); // ← this was "posts" before
  const likeRef = doc(dbd, "videos", video.id, "likes", user.uid); // ← same here

  try {
    const snap = await getDoc(likeRef);

    if (snap.exists()) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(videoRef, { likesCount: increment(-1) });
    } else {
      // Like
      await setDoc(likeRef, {
        uid: user.uid,
        name: userData?.fullName || "Unknown",
        timestamp: Date.now(),
      });
      await updateDoc(videoRef, { likesCount: increment(1) });
    }
  } catch (err) {
    console.error("Error toggling like:", err);
  }
};


useEffect(() => {
  if (!video?.id || !user) return;

  const likesRef = collection(dbd, "videos", video.id, "likes");

  const unsubscribe = onSnapshot(likesRef, (snapshot) => {
    const likes = snapshot.docs.map(doc => doc.data());
    
    setLikesCount(likes.length);
    setIsLiked(likes.some((like) => like.uid === user.uid));
  });

  return () => unsubscribe();
}, [video?.id, user]);


const cardRef = useRef<HTMLDivElement>(null);
const [cardWidth, setCardWidth] = useState<number | null>(null);



const deleteVideoFromFirestore = async (videoId: string) => {
  try {
    await deleteDoc(doc(dbd, "videos", videoId));
    alert("Video deleted successfully!");
  } catch (err) {
    console.error("Failed to delete video:", err);
    alert("Error deleting video.");
  }
};
useEffect(() => {
  if (cardRef.current) {
    setCardWidth(cardRef.current.offsetWidth);
  }
}, [commentsOpen]); // updates when modal opens

  // Inside your VideoItem component
const videoRef = useRef<HTMLVideoElement>(null);

useEffect(() => {
  if (commentsOpen && videoRef.current) {
    videoRef.current.pause();
  }
}, [commentsOpen]);

useEffect(() =>{
console.log("commentcount", commentcount)
},[commentcount])

  const timeAgo = formatDistanceToNow(
    video.timestamp?.toDate ? video.timestamp.toDate() : new Date(video.timestamp),
    { addSuffix: true }
  );

  return (
    <Card ref={cardRef} className="w-full h-[90svh] snap-start relative overflow-hidden rounded-xl shadow-xl flex flex-col">
      <div className="absolute inset-0 ">
       <video
  ref={videoRef}
  src={video.url}
  controls
  className="absolute inset-0 w-full h-full object-cover"
  preload="metadata"
/>
        {/* <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="w-16 h-16 text-white/70" fill="currentColor" />
        </div> */}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white flex flex-col justify-end h-1/3">
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/profile/${video.user.uid}`}>
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={video.user.avatarUrl} alt={video.user.name} />
              <AvatarFallback>{video.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/profile/${video.user.uid}`}
              className="font-semibold hover:underline text-sm"
            >
              {video.user.name}
            </Link>
            <p className="text-xs">{timeAgo}</p>
          </div>
        </div>
        <p className="text-sm mb-3 line-clamp-2">{video.description}</p>
    
      
   
      </div>

 
      <div className="absolute right-2 bottom-1/4 sm:bottom-4 flex flex-col gap-3 items-center text-white">
  
    {user?.uid === video.user.uid && (<>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon"><MoreVertical /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {/* <DropdownMenuItem onClick={async () => {
        try {
          await deleteVideo({
            videoId: video.id,
            cloudinaryUrl: video.url,
            userId: user.uid,
            ownerId: video.user.uid,
          });
          router.refresh(); // or router.push("/videos");
        } catch (err) {
          alert("Failed to delete video.");
          console.error(err);
        }
      }}>
        Delete
  </DropdownMenuItem> */}

        <DropdownMenuItem onClick={() => setShowConfirm(true)}>
  Delete
</DropdownMenuItem>
    
    </DropdownMenuContent>
  </DropdownMenu>



<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete this video?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. It will permanently delete this video from your account and Cloudinary.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={async () => {
          try {
            await deleteVideo({
              videoId: video.id,
              cloudinaryUrl: video.url,
              userId: user.uid,
              ownerId: video.user.uid,
            });
            setShowConfirm(false);
            router.refresh(); // or router.push("/videos");
          } catch (err) {
            alert("Failed to delete video.");
            console.error(err);
          }
        }}
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

</>
)}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLike}
          className={`flex flex-col items-center h-auto p-1 ${isLiked ? "text-destructive" : ""}`}
        >
          <Heart className={`h-7 w-7 ${isLiked ? "fill-destructive" : ""}`} />
          <span className="text-xs font-medium">{likesCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommentsOpen(true)}
          className="flex flex-col items-center h-auto p-1"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="text-xs font-medium">{commentcount ? commentcount : 0 }</span>
        </Button>
      
    
<DropdownMenu>



     <DropdownMenuTrigger asChild>
            <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center h-auto p-1"
        >
          <Share2 className="h-7 w-7" />
          <span className="text-xs font-medium">Share</span>
        </Button>

          </DropdownMenuTrigger>
      
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => window.open(socialLinks.facebook, "_blank")}>
              <Facebook className="mr-2 h-4 w-4 text-blue-600" />
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(socialLinks.twitter, "_blank")}>
              <X className="mr-2 h-4 w-4 text-dark-500" />
              / X
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

 


  <CommentsModal
  width={containerWidth}
setCommentComunt={setCommentComunt}
        videoId={video.id}
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />


    

    </Card>
  );
}
