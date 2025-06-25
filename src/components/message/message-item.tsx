"use client";

import { cn } from "@/lib/utils";
import type { Message, User } from "@/lib/dummy-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isValid } from 'date-fns';
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Reply } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
interface MessageItemProps {
  message: Message;
  sender: User;
  isOwnMessage: boolean;
  onReply?: (message: Message) => void;
  repliesMap?: Map<string, Message>;
}

export function MessageItem({
  message,
  sender,
  isOwnMessage,
  onReply,
  repliesMap,
}: MessageItemProps) {

  const {userData} = useAuth();
 const messageDate = message?.timestamp ? new Date(message.timestamp) : null;
const [previewUrl, setPreviewUrl] = useState<string | null>(null);

 const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
  const timer = setTimeout(() => {
    if (onReply) onReply(message); // 👈 fixed: pass the message as argument online
  }, 600);
  setLongPressTimer(timer);
};


  const handleMouseUp = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  const repliedTo = message.replyToId ? repliesMap?.get(message.replyToId) : null;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewUrl(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);




// useEffect(() => {
//   const handleEsc = (e: KeyboardEvent) => {
//     if (e.key === "Escape") setPreviewUrl(null);
//   };
//   window.addEventListener("keydown", handleEsc);
//   return () => window.removeEventListener("keydown", handleEsc);
// }, []);

  const formattedTime =
    messageDate && isValid(messageDate) ? format(messageDate, "p") : "";

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      ref={ref}
     className={cn("flex items-end gap-2 py-2", isOwnMessage ? "justify-end" : "justify-start")}  >
       {!isOwnMessage && (
        <Avatar className="h-8 w-8 self-start">
          <AvatarImage src={sender.avatarUrl} alt={sender.name} />
          <AvatarFallback>{sender?.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}




    <div className="flex flex-col max-w-[70%]">
        {repliedTo && (
          <div className="text-xs text-muted-foreground border-l-2 border-primary/50 pl-2 mb-1 bg-muted rounded-md">
            <span className="font-semibold">
              {repliedTo.senderId === sender.id ? 'You' : sender.fullName}
            </span>: {repliedTo.content.slice(0, 60)}
          </div>
        )}


     </div>



      <div
        className={cn(
          "max-w-[70%] rounded-xl px-4 py-2.5 shadow-md",
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border"
        )}
      >
{message.type === "image" ? (
  <img
    src={message.content}
    alt="sent media"
    className="w-full max-w-[75%] md:max-w-[400px] rounded-lg object-contain cursor-pointer"
    onClick={() => setPreviewUrl(message.content)}
  />
) : message.type === "video" ? (
  <video
    src={message.content}
    controls
    className="w-full max-w-[75%] md:max-w-[400px] rounded-lg cursor-pointer"
    onClick={() => setPreviewUrl(message.content)}
  />
) : (
  <>
  {repliedTo && (
    <div className="mb-1 p-2 border-l-4 border-blue-500 bg-background rounded text-sm text-muted-foreground">
      <p className="font-semibold">
        {repliedTo.senderId === sender.id ? sender.fullName : "You"}
      </p>
      <p>{repliedTo.content}</p>
    </div>
  )}
    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

</>
)}




  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>  onReply()}
              className="h-5 w-5"
            >
              <Reply className="w-4 h-4" />
            </Button>
          </div>

    <p className={cn(
            "text-xs mt-1",
            isOwnMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left"
        )}>
            {formattedTime}
        </p>
      </div>
      {isOwnMessage && (
        <Avatar className="h-8 w-8 self-start">
          <AvatarImage src={userData?.avatarUrl} alt={userData?.fullName} data-ai-hint="user avatar" />
          <AvatarFallback>{userData?.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}



      {previewUrl && (
  <div
    onClick={() => setPreviewUrl(null)}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    {previewUrl.endsWith(".mp4") || previewUrl.includes("video") ? (
      <video src={previewUrl} controls autoPlay className="max-h-full max-w-full rounded" />
    ) : (
      <img src={previewUrl} alt="preview" className="max-h-full max-w-full rounded" />
    )}
  </div>
)}

    </div>
  );
}
