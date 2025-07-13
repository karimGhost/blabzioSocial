"use client";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, dbd } from "@/lib/firebase";
import { VideoItem } from "@/components/video/video-item";

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

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
const {user} = useAuth()

  // useEffect(() => {
  //   const q = query(collection(dbd, "videos"), orderBy("timestamp", "desc"));
  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const videoList: VideoData[] = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     })) as VideoData[];
  //     setVideos(videoList);
  //     console.log("videoList", videoList)
  //   });

  //   return () => unsubscribe();
  // }, []);





  useEffect(() => {
    if (!user?.uid) return;
  
    const fetchData = async () => {
      try {
        // 1. Get blocked + following UIDs
        const [blockedSnap, followingSnap] = await Promise.all([
          getDocs(collection(db, "users", user.uid, "blocked")),
          getDocs(collection(db, "users", user.uid, "following")), // <-- or "followers" if you meant that
        ]);
  
        const blockedUids = blockedSnap.docs.map(doc => doc.id);
        const followingUids = followingSnap.docs.map(doc => doc.id);
  
        // 2. Reference videos collection
        const videosRef = collection(dbd, "videos");
        const q = query(videosRef, orderBy("timestamp", "desc"));
  
        // 3. Listen for video updates
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const rawVideos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as VideoData[];
  
          // 4. Get unique author UIDs
          const authorUids = Array.from(
            new Set(rawVideos.map(video => video?.user?.uid).filter(Boolean))
          );
  
          // 5. Get author privacy & block info
          const authorDocs = await Promise.all(
            authorUids.map(async (uid) => {
              const userDoc = await getDoc(doc(db, "users", uid));
              const theirBlockedSnap = await getDocs(
                collection(db, "users", uid, "blocked")
              );
  
              return {
                uid,
                exists: userDoc.exists(),
                data: userDoc.data(),
                blockedUids: theirBlockedSnap.docs.map(doc => doc.id),
              };
            })
          );
  
          const authorMap: Record<
            string,
            { isPrivate: boolean; isPremium?: boolean; blockedUids: string[]; terminated: boolean }
          > = {};
  
          authorDocs.forEach((doc) => {
            if (doc.exists) {
              authorMap[doc.uid] = {
                isPrivate: doc.data?.privacySettings?.privateAccount|| false,
                isPremium: doc.data?.isPremium || false,
                blockedUids: doc.blockedUids || [],
               terminated: doc.data?.terminated || false,

              };
            }
          });
  


          // 6. Filter videos based on privacy & blocks
          const filteredVideos = rawVideos.filter((video) => {
            const authorId = video?.user?.uid;
            if (!authorId) return false;
  
            // Hide if I blocked them
            if (blockedUids.includes(authorId)) return false;
  
            // Hide if they blocked me
            const blockedMe = authorMap[authorId]?.blockedUids.includes(user?.uid);
            if (blockedMe) return false;
  
            // Always show my own videos
            if (authorId === user?.uid) return true;
  
//check account Termination then dont allow 
  const terminated = authorMap[authorId]?.terminated;
     if(terminated) return false;



            const isPrivate = authorMap[authorId]?.isPrivate;
  


            // Show if not private
            if (!isPrivate) return true;
  
            // Show if I follow them and content is private
            return followingUids.includes(authorId);
          });
  
          setVideos(filteredVideos);
        });
  
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
  
    fetchData();
  }, [user?.uid]);



  return (
    <div className="flex flex-col items-center gap-4 p-4  text-white">
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
  );
}
