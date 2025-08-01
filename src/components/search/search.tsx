"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Play, UserRoundPlus } from "lucide-react";

export function UserCard({ user }: { user: any }) {
  return (
    <Link
      href={`/profile/${user.uid}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-background shadow hover:shadow-md transition"
    >
      <Image
        src={user.avatarUrl || "/default-avatar.png"}
        alt={user.fullName}
        width={50}
        height={50}
        className="rounded-full object-cover w-12 h-12"
      />

      <div>
        <p className="font-semibold text-sm">{user.fullName}</p>
        <p className="text-muted-foreground text-xs">@{user.username}</p>
      </div>

      <div>
        <UserRoundPlus className="w-4 h-4 float-right text-orange-400 -mt-3"/>
        </div>
    </Link>
  );
}

export function PostCard({ post }: { post: any }) {
 
  return (
    <div className="rounded-xl bg-background shadow hover:shadow-md transition overflow-hidden">
      <Link href={`/feed/${post.id}`}>

    <div className="flex"> 
      
     <span>
       <Image
        src={post.author.avatarUrl || "/default-avatar.png"}
        alt={post.author.name[0]}
        width={50}
        height={50}
        className="rounded-full object-cover w-12 h-12"
      />
      
      </span>   

     
        <p className="font-semibold text-sm p-3">{ post.author.name}</p>
        </div>

        <div className="p-4 space-y-2">
          <p className="font-medium text-sm">{post.content}</p>
       
          {post.mediaUrl && (
            <Image
              src={post.mediaUrl[0]}
              alt="Post image"
              width={600}
              height={400}
              className="rounded-md object-cover w-full h-48"
            />
          )}

        </div>
        <div className="px-4 pb-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>{post.likesCount || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments?.length || 0}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function VideoCard({ video }: { video: any }) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="rounded-xl bg-background shadow hover:shadow-md transition block overflow-hidden"
    >
      <div className="relative">
        <video
          src={video.url}
          muted
          loop
          playsInline
          autoPlay={video.url ? true : false}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <Play className="text-white w-8 h-8" />
        </div>
      </div>
      <div className="p-3 text-sm">
        <p className="line-clamp-2">{video.description}</p>
      </div>
    </Link>
  );
}
