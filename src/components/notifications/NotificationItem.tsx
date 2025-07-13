"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { dbe } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, MessageCircle, Reply, Share, ShieldAlert, UserPlus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { notification } from "./notifications";
import { useRouter } from "next/navigation";
interface Notification {
  id: string;
  type: "follow" | "like" | "comment" | "shared" | "reply" | "PolicyViolation";
       fullName: string;
    avatarUrl: string;

  fromUser:string ;
  postId?: string;
  commentId?: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
 const {route} = useRouter()
const notifications = notification(user?.uid);



 const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "follow":
      return <UserPlus className="h-4 w-4 text-primary" />;
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "shared":
      return <Share className="h-4 w-4 text-red-500" />;
    case "reply":
      return <Reply className="h-4 w-4 text-red-500" />;
    case "PolicyViolation":
      return <ShieldAlert className="h-4 w-4 text-red-600" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};


return (
  <div className="p-4 max-w-xl mx-auto">
    <h2 className="text-xl font-semibold mb-4">Notifications</h2>

    {notifications.length === 0 ? (
      <p className="text-sm text-muted-foreground">No notifications yet.</p>
    ) : (
      <ul className="space-y-3">
          {notifications.map((n) => (

            <li onClick={() => {
n.type === "follow"  && route(`/profile/${n.fromUser}`)} } key={n.id} className="flex items-start gap-3 p-3 rounded-md bg-muted">
              <Avatar className="h-9 w-9">
                <AvatarImage src={n?.avatarUrl} />
                <AvatarFallback>{n?.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm">
              <p>
  <Link href={`/profile/${n.fromUser}`} className="font-medium hover:underline">
    {n.fullName}
  </Link>{" "}

  {n.type === "follow" && "followed you"}

  {n.type === "like" && (
                <>
                  liked your post{" "}
                  {n.postId && (
                    <Link href={`/feed/${n.postId}`} className="underline">
                      view post
                    </Link>
                  )}
                </>
  )}

  {n.type === "comment" && (
                <>
                  commented on your post{" "}
                  {n.postId && (
                    <Link href={`/feed/${n.postId}`} className="underline">
                      view post
                    </Link>
                  )}
                </>
  )}

  {n.type === "PolicyViolation" && (
                <>
                  <span className="text-red-600 font-medium">⚠️ Policy Violation</span> — Your content may have violated our community rules.{" "}
                  {n.postId && (
                    <Link href={`/feed/${n.postId}`} className="underline">
                      view post
                    </Link>
                  )}
                </>
  )}
</p>



                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                </p>
              </div>

 {
n.type === "follow"  ?
              <div className="mt-1"> <Link  href={`/profile/${n.fromUser}`} > {getIcon(n.type)}  </Link> </div>
              :
                            <div className="mt-1"> {getIcon(n.type)}</div>


 }



            </li>
          ))}
      </ul>
    )}
  </div>
);
}