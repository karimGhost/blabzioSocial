"use client";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { collection, onSnapshot,doc, snapshot, orderBy, query } from "firebase/firestore";
import { dbd } from "@/lib/firebase";
import { VideoItem } from "@/components/video/video-item";
import { useParams } from "next/navigation";
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

useEffect(() => {
  if (!id) return;

  const docRef = doc(dbd, "videos", id as string);
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const videoData = { id: snapshot.id, ...snapshot.data() } as VideoData;
      setVideos([videoData]); // or setVideo(videoData) if it's a single object
    } else {
      console.warn("Video not found");
    }
  });

  return () => unsubscribe();
}, [id]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-black text-white">
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
