"use client";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { collection, onSnapshot,doc, orderBy, query, getDocs, getDoc } from "firebase/firestore";
import { db, dbd } from "@/lib/firebase";
import { VideoItem } from "@/components/video/video-item";
import { useParams } from "next/navigation";
import Head from "next/head";
interface VideoUser {
  uid: string;
  name: string;
  username: string;
  avatarUrl: string;
}

interface VideoData {
  id: string;
  url: string;
  description: string;
  timestamp: any;
  user: VideoUser;
  likesCount: number;
  commentsCount: number;
}

export default function VideoPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const { id } = useParams();
const {user} = useAuth()
// useEffect(() => {
//   if (!id) return;

//   const docRef = doc(dbd, "videos", id as string);
//   const unsubscribe = onSnapshot(docRef, (snapshot) => {
//     if (snapshot.exists()) {
//       const videoData = { id: snapshot.id, ...snapshot.data() } as VideoData;
//       setVideos([videoData]); // or setVideo(videoData) if it's a single object
//     } else {
//       console.warn("Video not found");
//     }
//   });

//   return () => unsubscribe();
// }, [id]);





useEffect(() => {
  if (!user?.uid || !id) return;

  const fetchVideo = async () => {
    try {
      // Get blocked + following UIDs
      const [blockedSnap, followingSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "blocked")),
        getDocs(collection(db, "users", user.uid, "following")),
      ]);

      const blockedUids = blockedSnap.docs.map(doc => doc.id);
      const followingUids = followingSnap.docs.map(doc => doc.id);

      // Reference the single video document
      const videoDocRef = doc(dbd, "videos", id as string);

      const unsubscribe = onSnapshot(videoDocRef, async (snapshot) => {
        if (!snapshot.exists()) {
          setVideos([]); // or set to null if preferred
          return;
        }

        const videoData = {
          id: snapshot.id,
          ...snapshot.data(),
        } as VideoData;

        const authorId = videoData?.user?.uid;
        if (!authorId) return;

        // Get author doc and their blocked list
        const [authorDoc, theirBlockedSnap] = await Promise.all([
          getDoc(doc(db, "users", authorId)),
          getDocs(collection(db, "users", authorId, "blocked")),
        ]);

        if (!authorDoc.exists()) {
          setVideos([]);
          return;
        }

        const isPrivate = authorDoc.data()?.privacySettings?.privateAccount || false;
        const isBlockedByAuthor = theirBlockedSnap.docs.some(doc => doc.id === user.uid);
        const isFollowing = followingUids.includes(authorId);

        // Filter logic
        if (blockedUids.includes(authorId)) return setVideos([]);
        if (isBlockedByAuthor) return setVideos([]);
        if (authorId === user.uid) return setVideos([videoData]);
        if (!isPrivate || isFollowing) return setVideos([videoData]);

        // Else: not allowed to view
        setVideos([]);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };

  fetchVideo();
}, [user?.uid, id]);


  return (

    <>
     <Head>
        { videos.map((video) => ( <>
        
       <title>{video?.description || "Blabzio Feed"}</title>
            <meta property="og:title" content={video?.description || "Blabzio scroll"} />
                   <meta property="og:description" content={video.description?.slice(0, 100) || "View this post on Blabzio!"} />
    
            <meta property="og:image" content={video?.url  || "/android-chrome-192x192.png"} />
            <meta property="og:url" content={`https://blabzio.vercel.app/feed/${video.id}`} />
            <meta property="og:type" content="video" />
            <meta name="twitter:card" content="summary_large_image" />
             </>  
        ))}
          </Head>
    


   
    <div className="flex flex-col items-center gap-4 p-4 text-white">
      {videos.length === 0 ? (
        <p className="text-gray-400 text-center mt-12">No videos yet. Upload one to get started!</p>
      ) : (
<div className="w-full max-w-2xl mx-auto space-y-6 snap-y snap-mandatory overflow-y-auto  your-element h-[calc(100vh-4rem)] pb-16">
          {videos.map((video) => (
  <VideoItem key={video.id} video={video} containerWidth={640} /> // max-w-2xl = 640px
          ))}
        </div>
)}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-20">
        <Link href="/videos/record">
         <Button
  size="lg"
  className="sm-p-4 rounded-full shadow-lg bg-orange-100/30 backdrop-blur-md text-orange-600 hover:bg-orange-500 hover:text-white transition"
  variant="default"
>
  <Camera className="h-6 w-6 mr-2" />
  Record Video
</Button>
        </Link>
      </div>
    </div>
     </>
  );
}
