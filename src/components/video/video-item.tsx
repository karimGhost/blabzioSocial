"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Play, Facebook, Twitter, Send, MoreVertical,X, Trash2,  
  Pause,
  Volume2,
  VolumeX,
  Maximize2, } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import CommentsModal from "../CommentsModal";
import { useAuth } from "@/hooks/useAuth";
import { Admin, db, dbd, dbe } from "@/lib/firebase";
import { doc, collection, deleteDoc, setDoc, addDoc, query, onSnapshot, getDoc, orderBy,where, increment, updateDoc,  getDocs, serverTimestamp} from "firebase/firestore";
import { DropdownMenuContent,DropdownMenuTrigger, DropdownMenuItem, DropdownMenu } from "../ui/dropdown-menu";
import ShareDropdown from "../shareDropdown";
import { MouseEvent } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
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
  const {user, userData} = useAuth();
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);
const heartId = useRef(0);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount || 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
 const [commentcount, setCommentComunt] =  useState<number >()
const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const {toast} = useToast();
 const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://blabzio.vercel.app";
const shareUrl = `${baseUrl}/feed/${video.id}`;
const shareText = encodeURIComponent(`🔥 Check out this video on 🧡 Blabzio!\n`);

const socialLinks = {
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
  twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
  whatsapp: `https://wa.me/?text=${shareText}${encodeURIComponent(shareUrl)}`,
  telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
};
const [likeEmoji, setLikeEmoji] = useState<string>("");

const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

function handleLikeBurst( videoId: string) {

// for(let i = 5; i >= heartId.current; heartId.current++ ){
//   if(heartId.current  === 5){
//   break; 
//   }
// }

  const newHeart = {
    id: heartId.current++,
    left: Math.random() * 40 - 20, // random horizontal drift
  };


  // Remove it after animation
  setTimeout(() => {
    setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
  }, 2000);
}


function triggerHeart(videoId: string) {

  // Clear any previous timeout
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  // Set the emoji

  // Auto-clear it after 1 second
  timeoutRef.current = setTimeout(() => {
    setLikeEmoji("");
  }, 1000);
}
const handleLike = async (
  e: MouseEvent<HTMLElement>, // ✅ works for <div>, <button>, etc.
  videoId: string
) => {
    e.preventDefault();

 const newHeart = {
    id: heartId.current++,
    left: Math.random() * 40 - 20, // random horizontal drift
  };
  setHearts((prev) => [...prev, newHeart]);
  setLikeEmoji(video.id);
        handleLikeBurst(video.id);


triggerHeart(video.id)
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

   const notificationsRef = collection(dbe, "notifications");
const postId = video.id;
const fromUser = user?.uid;
const toUser = video.user.uid;


const existingQuery = query(
  notificationsRef,
  where("type", "==", "like"),
  where("fromUser", "==", fromUser),
  where("toUser", "==", toUser),
   where("content", "==", "video"),
  where("postId", "==", postId),
  )


const existingSnapshot = await getDocs(existingQuery);

if(existingSnapshot.empty){
         await addDoc(notificationsRef, {
    type: "like",
    fromUser: user?.uid,
    toUser: video.user.uid,
    postId,
     fullName: userData.fullName ,
    avatarUrl: userData.avatarUrl,
    timestamp:  Date.now(),
    read: false,
    content: "video"
  });

}

      const otherUserSnap = await getDoc(doc(db, "users", video.user.uid));
    
                      const recipientFCMToken = otherUserSnap?.data()?.fcmToken;
    
    if (recipientFCMToken) {
      try {
        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: recipientFCMToken,
            title: ` ${userData?.fullName   || "Someone"} liked your video`,
            body:   "Tap to see!",
           clickAction: `https://blabzio-social.vercel.app/videos/${postId}`,
    
          }),
        });
        console.log("📩 Notification sent to:", recipientFCMToken);
      } catch (err) {
        console.error("🔥 Failed to send notification:", err);
      }
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




 const [showReportModal, setShowReportModal] = useState<string | null>(null)



const submitReport = async (postId: string, reason: string, postOwner: string) => {
    if (!user) return;


   

  try {
    await addDoc(collection(Admin, "Postsreports"), {
      type: "post",
      itemId: postId,
      reason,
      postOwner,
      reportedBy: user?.uid ?? null,
      createdAt: serverTimestamp(),
    });
    setShowReportModal(null);

toast({
        title: "Thanks .",
        description: "Your report has been submitted!.",
      
      });
  } catch (err) {
    console.error("Report error:", err);
    toast({
        title: "Failed .",
        description: "Failed to submit report. try again after some time .",
      
      });
  }
};


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
  const [isPlaying, setIsPlaying] = useState(false);
const [isMuted, setIsMuted] = useState(true);
const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(0.5); // default 50%
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const userWantsSound = useRef(false); // 🔥 track if user tapped unmute once

 useEffect(() => {
    if (showControls) {
      const timeout = setTimeout(() => setShowControls(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [showControls]);

//  useEffect(() => {
//     if (videoRef.current) {
//       videoRef.current.volume = volume;
//       // videoRef.current.muted = isMuted;
//     }
//   }, [volume, isMuted]);

const unmuteAll = () => {
  setIsMuted(false);
  if (videoRef.current) videoRef.current.muted = false;

  // Dispatch a global custom event
  window.dispatchEvent(new CustomEvent("UNMUTE_ALL_VIDEOS"));
};
 const handleUnmuteAll = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

 

   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
const togglePlayPause = () => {
  const video = videoRef.current;
  if (!video) return;
  if (video.paused) {
    video.play();
    setIsPlaying(true);
  } else {
    video.pause();
    setIsPlaying(false);
  }
};


const [isActive, setIsActive] = useState(false); 




const toggleMute = () => {
  if (isMuted) {
    window.dispatchEvent(new CustomEvent("UNMUTE_USER_TRIGGERED"));

  }else{

      setIsMuted(true);
  }

};

const toggleFullscreen = () => {
  const video = videoRef.current;
  if (!video) return;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    video.requestFullscreen();
  }
};

 useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          videoRef.current?.play();
          setIsPlaying(true);
        setIsActive(true); 
             const newUrl = `/videos/${video.id}`;
  window.history.replaceState(null, "", newUrl);
         
 if (userWantsSound.current && videoRef.current) {
            videoRef.current.muted = false;
            setIsMuted(false);
          }


  
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);

        setIsActive(false); 
         if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
          }
        }
      },
      {
        threshold: 0.7, // Adjust visibility threshold (70% visible)
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [video.id, router]);


const handleGlobalUnmute = () => {
  if (videoRef.current) {
    videoRef.current.muted = false;
    setIsMuted(false);
    // ✅ DON'T call play()
  }
};

 useEffect(() => {
    const handleUnmute = () => {
      userWantsSound.current = true;

      if (isActive && videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    };

    window.addEventListener("UNMUTE_USER_TRIGGERED", handleUnmute);
    return () => window.removeEventListener("UNMUTE_USER_TRIGGERED", handleUnmute);
  }, [isActive]);

return (
    <Card   onMouseOver={() => setShowControls(true)}
 ref={cardRef} className="w-full h-[90svh] snap-start relative overflow-hidden rounded-xl shadow-xl flex flex-col">
   
    
      <div className="absolute inset-0 bg-black">
  
<>
       <video
  ref={videoRef}
 onDoubleClick={(e) => handleLike(e, video.id)}
   src={video.url}
   controls={false}
     muted={isMuted}
  onClick={togglePlayPause}

  className="absolute inset-0 w-full h-full object-cover"
  preload="metadata"
  onMouseEnter={() => setShowControls(true)}
  onMouseLeave={() => setShowControls(false)}
  playsInline
  loop
          onLoadedData={() => videoRef.current?.play()}

  />


  {showControls && (
        <div className="absolute top-5 left-0 right-0 flex justify-between items-center px-6 text-white z-10">
          {/* Play / Pause */}
          <button
            onClick={togglePlayPause}
            className="bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Volume Control with Hover Slider */}
          <div
            className="relative flex items-center group"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={toggleMute}
              className="bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
            >
              {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            {showVolumeSlider && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="absolute bottom-full mb-2 w-24 h-1 accent-orange-400 bg-white/30 rounded-lg cursor-pointer"
              />
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
          >
            <Maximize2 size={24} />
          </button>
        </div>
      )}
    </>
 

{(
 
<>


{likeEmoji === video.id && (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pop">
    <Heart
      fill="#f97316" // Tailwind's orange-400 hex
      className="h-[80px] w-[80px] text-orange-400"
    />
  </div>
)}
  {hearts.map((heart) => (
  <div
      key={heart.id}
      className="absolute bottom-12 left-1/2 animate-floatUp"
      style={{
        transform: `translateX(${heart.left}px)`,
      }}
    >
      <Heart
        fill="#f97316"
        className="h-6 w-6 text-orange-400 drop-shadow-lg"
      />
    </div>
  ))}
</>

)}


        {/* <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="w-16 h-16 text-white/70" fill="currentColor" /> flex
        </div> */}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white flex flex-col justify-end h-1/3">
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/profile/${video.user.uid}`}>
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={video.user.avatarUrl} alt={video.user.username || video.user.name } />
              <AvatarFallback>{video.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/profile/${video.user.uid}`}
              className="font-semibold hover:underline text-sm"
            >
              {video.user.username || video.user.name}
            </Link>
            <p className="text-xs">{timeAgo}</p>
          </div>
        </div>
        <p className="text-sm mb-3 line-clamp-2">{video.description}</p>
    
      
   
      </div>

 
      <div className="absolute right-2 bottom-1/4 sm:bottom-4 flex flex-col gap-3 items-center text-white">
  
 {user?.uid !== video.user.uid && (<>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon"><MoreVertical /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
     

        <DropdownMenuItem 
        
          onClick={() => setShowReportModal(video.id)}
        >
  report
</DropdownMenuItem>
    
    </DropdownMenuContent>
  </DropdownMenu>



 {showReportModal ===  video.id && (
  <Dialog open onOpenChange={() => setShowReportModal(null)}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Report Post</DialogTitle>
        <DialogDescription>Select a reason for reporting this post.</DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        {[
          "Nudity or sexual activity",
          "Hate speech or symbols",
          "Violence or dangerous behavior",
          "Spam or misleading",
          "Harassment or bullying",
          "Other"
        ].map((reason) => (
          <Button
            key={reason}
            variant="outline"
            className="w-full justify-start"
            onClick={() => submitReport( video.id, reason, video.user.uid)}
          >
            {reason}
          </Button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
)}
</>)

}




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
            router.refresh(); // or router.push("/videos"); video.time
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
onClick={(e) => handleLike(e, video.id)}
          className={`flex flex-col items-center h-auto p-1 text-primary` }
        >

           <Heart
      fill= {isLiked ? `#f97316` : "" }
           className={`h-7 w-7 `} />

          <span className="text-xs font-medium " style={{color:"white", textShadow:"1px 1px black"}}>{likesCount}</span>
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
         <ShareDropdown  shareUrl={shareUrl }/>
          </DropdownMenuContent>
          </DropdownMenu>
      </div>

 


  <CommentsModal
  width={containerWidth}
setCommentComunt={setCommentComunt}
        videoId={video.id}
        authorId={video.user.uid}
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />


    

    </Card>
  );
}
