"use client";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function VideoCard({ video }: { video: any }) {
  return (
    <Card className="p-4 space-y-2">
      <video className="w-full rounded-lg" controls>
        <source src={video?.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p className="font-semibold">{video?.title || "Video title"}</p>
    </Card>
  );
}
