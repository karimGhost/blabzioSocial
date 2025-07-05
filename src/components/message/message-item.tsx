"use client";

import { cn } from "@/lib/utils";
import type { Message, User } from "@/lib/dummy-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isValid } from 'date-fns';
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { MoreVertical, Reply } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LinkPreview from "./LinkPreview";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
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

};
  const [startX, setStartX] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [bubbleKey, setBubbleKey] = useState(0); // 👈 force rerender
const touchStartYRef = useRef<number | null>(null); // track Y for scroll

  const TRIGGER_THRESHOLD = 60;
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);
  const MAX_DRAG = 80;
  const TRIGGER = 60;
const [Touch,setTouch] = useState(true)
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setTouch(false)
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startXRef.current = x;
    startYRef.current = y;
    triggeredRef.current = false;
    if (ref.current) ref.current.style.transition = 'none';
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!ref.current || startXRef.current === null || startYRef.current === null) return;

    const isTouch = 'touches' in e;
    const x = isTouch ? e.touches[0].clientX : e.clientX;
    const y = isTouch ? e.touches[0].clientY : e.clientY;

    const deltaX = x - startXRef.current;
    const deltaY = y - startYRef.current;

    // 👇 Only swipe if horizontal movement dominates
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (isTouch) e.preventDefault(); // allow vertical scroll by skipping this otherwise

      if (!isOwnMessage && deltaX > 0) {
        ref.current.style.transform = `translateX(${Math.min(deltaX, MAX_DRAG)}px)`;
      } else if (isOwnMessage && deltaX < 0) {
        ref.current.style.transform = `translateX(${Math.max(deltaX, -MAX_DRAG)}px)`;
      }
    }
  };

  const handleEnd = () => {
    if (!ref.current) return;

    ref.current.style.transition = 'transform 150ms ease-out';

    const transform = ref.current.style.transform;
    const offset = parseInt(transform.replace(/[^-0-9]/g, '')) || 0;

    if (!isOwnMessage && offset > TRIGGER && !triggeredRef.current) {
      triggeredRef.current = true;
 if (onReply) onReply(message);
    } else if (isOwnMessage && offset > TRIGGER && !triggeredRef.current) {
      triggeredRef.current = true;
 if (onReply) onReply(message);

}

    ref.current.style.transform = 'translateX(0px)';
    startXRef.current = null;
    startYRef.current = null;
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


function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
}

  const url = extractUrl(message.content);
function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        className="text-blue-500 underline break-words"
        target="_blank"
        rel="noopener noreferrer"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
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
      ref={ref}
      className={cn(
        "flex items-end gap-2 py-2 select-none  touch-pan-y", 
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    onScroll={() => setTouch(true)}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseMove={(e) => startXRef.current !== null && handleMove(e)}
      onMouseUp={handleEnd}
      onMouseLeave={() => startXRef.current !== null && handleEnd()}
    >
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

     <p className="text-sm break-words whitespace-pre-wrap break-all">
      {linkify(repliedTo.content)}
</p>
    {url && <LinkPreview url={url} />}

    </div>
  )}
<p className="text-sm break-words whitespace-pre-wrap break-all">
      {linkify(message.content)}
</p>
    {url && <LinkPreview url={url} />}

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
