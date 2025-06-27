"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./message-item";
import { rtdb } from "@/lib/firebase";
import { Send, Paperclip, Smile, Phone, Video as VideoIcon, MoreVertical, ArrowLeft, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker from 'emoji-picker-react';
import {
  collection, query, onSnapshot, getDoc, getDocs, deleteDoc, orderBy,
  addDoc, serverTimestamp, doc, setDoc, updateDoc
} from "firebase/firestore";
import { dbc,dbb, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { formatDistanceToNow } from 'date-fns';
import { getDatabase, onValue, ref } from "firebase/database";
import { Message } from "postcss";

interface ChatAreaProps {
  conversation: any;
}

export function ChatArea({ conversation }: ChatAreaProps) {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [Blocked, setBlocked] = useState(false);
const [isOnline, setIsOnline] = useState(false);
const [lastSeen, setLastSeen] = useState<number | null>(null);

  const checkBlockedStatus = async (viewerId: string, profileId: string) => {
    const [blockedByThem, youBlockedThem] = await Promise.all([
      getDoc(doc(db, "users", profileId, "blocked", viewerId)),
      getDoc(doc(db, "users", viewerId, "blocked", profileId)),
    ]);
    return {
      isBlocked: blockedByThem.exists(),
      youBlocked: youBlockedThem.exists(),
    };
  };


  useEffect(() => {
  if (!conversation?.participant?.id) return;

 
  const statusRef = ref(rtdb, `/onlineStatus/${conversation.participant.id}`);

  const unsubscribe = onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      setIsOnline(data.state === "online");
      setLastSeen(data.last_changed);
    }
  });

  return () => unsubscribe();
}, [conversation?.participant?.id]);


  useEffect(() => {
    const checkIfBlocked = async () => {
      const id = conversation?.participant?.id;
      if (!user?.uid || !id) return;
      const stringId = Array.isArray(id) ? id[0] : id;
      try {
        const { isBlocked, youBlocked } = await checkBlockedStatus(user.uid, stringId);
        setIsBlocked(isBlocked);
        setBlocked(youBlocked);
      } catch (error) {
        console.error("Error checking block status", error);
      }
    };
    checkIfBlocked();
  }, [user?.uid, conversation?.participant?.id]);

  const openFilePicker = () => fileInputRef.current?.click();
  const handleEmojiClick = (emojiData: any) => setNewMessage((prev) => prev + emojiData.emoji);

  useEffect(() => {
    const feed = localStorage.getItem("feed");
    if (feed) setNewMessage((prev) => prev + feed);
  }, []);




  useEffect(() => {
    if (!conversation) return;
    const q = query(collection(dbc, "conversations", conversation?.id, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]");
      if (scrollViewport) scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);




 const handleTyping = () => {

  if (!user?.uid || !conversation?.id) return;

  const typingRef = doc(dbc, "conversations", conversation.id, "typingStatus", user.uid);

  setDoc(typingRef, { isTyping: true, updatedAt: serverTimestamp() });

  if (typingTimeout.current) clearTimeout(typingTimeout.current);

  typingTimeout.current = setTimeout(() => {
    setDoc(typingRef, { isTyping: false }, { merge: true });
  }, 3000);
};



  const repliesMap = useMemo(() => {
    const map = new Map();
    messages.forEach((msg) => map.set(msg.id, msg));
    return map;
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid) return;

    const newMsg: Omit<Message, "id"> = {
      senderId: user.uid,
      receiverId: conversation.participant.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      conversationId: conversation.id,
      ...(replyTo ? { replyToId: replyTo.id } : {}),
    };

    await addDoc(collection(dbc, "conversations", conversation.id, "messages"), newMsg);
    await updateDoc(doc(dbc, "conversations", conversation.id), {
      lastMessage: {
        senderId: user.uid,
        content: newMessage,
        timestamp: new Date().toISOString(),
        isRead: false,
      },
      updatedAt: new Date().toISOString(),
    });
       

      



          const otherUserSnap = await getDoc(doc(db, "users", conversation.participant.id));

                  const recipientFCMToken = otherUserSnap?.data()?.fcmToken;
const directMessage = otherUserSnap?.data()?.notificationSettings?.directMessage;

if (recipientFCMToken && directMessage) {
  try {
    await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: recipientFCMToken,
        title: `New message from ${userData?.fullName || "Someone"}`,
        body: newMessage || "You have a new message! 💬",
        clickAction: `https://blabzio-social.vercel.app/messages`,

      }),
    });
    console.log("📩 Notification sent to:", recipientFCMToken);
  } catch (err) {
    console.error("🔥 Failed to send notification:", err);
  }
}
    setReplyTo(null);
    localStorage.removeItem("feed");
    setNewMessage("");
  };


  useEffect(() => {
  if (!conversation?.id || !user?.uid || !conversation?.participant?.id) return;

  const otherUserId = conversation.participant.id;
  const typingRef = doc(dbc, "conversations", conversation.id, "typingStatus", otherUserId);

  const unsubscribe = onSnapshot(typingRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      setIsTyping(data.isTyping === true);
    } else {
      setIsTyping(false);
    }
  });

  return () => unsubscribe();
}, [conversation?.id, user?.uid]);

  const handleClearChat = async () => {
    if (!conversation?.id) return;
    const snapshot = await getDocs(collection(dbc, "conversations", conversation.id, "messages"));
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
  };

  const handleFileUpload = async (file: File) => {
    const url = await uploadToCloudinary(file);
    if (!url) return;

    await addDoc(collection(dbc, "conversations", conversation.id, "messages"), {
      senderId: user?.uid,
      receiverId: conversation.participant.id,
      content: url,
      type: "image",
      timestamp: new Date().toISOString(),
      isRead: false,
      conversationId: conversation.id,
    });
  };
  // const repliedMessage = conversation.replyToId ? repliesMap.get(conversation.replyToId) : null; online

const handleBlockUser = async (username: string) => {
  if (!user) return;
  try {
    await setDoc(doc(db, "users", user.uid, "blocked", username), { blockedAt: Date.now() });

      toast({
      title: "BLOCKED",
      description:`${username} has been blocked.`,
      variant: "destructive",
    });
  } catch (err) {
    console.error("Block failed:", err);
  }
};

useEffect(() => {
  const handleUnload = () => {
    if (!user?.uid || !conversation?.id) return;
   
    const typingRef = doc(dbc, "conversations", conversation.id, "typingStatus", user.uid);
    setDoc(typingRef, { isTyping: false, updatedAt: serverTimestamp()  }, { merge: true });
  };


  window.addEventListener("beforeunload", handleUnload);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      handleUnload();
    }
  });

  return () => {
    window.removeEventListener("beforeunload", handleUnload);
    document.removeEventListener("visibilitychange", handleUnload);
  };
}, [conversation?.id, user?.uid]);
 
const handleMuteUser = async (username: string) => {
  if (!user) return;
  try {
    await setDoc(doc(db, "users", user.uid, "muted", username), { mutedAt: Date.now() });
      toast({
      title: "MUTED",
      description:`${username} has been MUTED.`,
    });

  } catch (err) {
    console.error("Mute failed:", err);
  }
};

  const getSender = (senderId: string): User => senderId === user?.uid ? user : conversation.participant;

  return (
    <div className="flex flex-col h-full bg-background" style={{ overflow: "scroll" }}>
      <header className="flex items-center gap-3 border-b p-3 h-16">
        <Link href="/messages" className="sm:hidden">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src={conversation?.participant?.avatarUrl} alt={conversation?.participant?.fullName} />
          <AvatarFallback>{conversation?.participant?.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">

               <Link href={`/profile/${conversation?.participant?.id}`} >

   <p className="font-semibold">{conversation?.participant?.fullName}</p> </Link>

<p className="text-xs text-muted-foreground">
  { isTyping
    ? isOnline ? "Typing..." : lastSeen
    : isOnline
      ? "Online"
      : lastSeen
        ? `Last seen ${formatDistanceToNow(new Date(lastSeen))} ago`
        : "Offline"}
</p>

</div>


  <div className="flex items-center gap-1">
     {   /*  <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>     reminder to add video and call 
          <Button variant="ghost" size="icon"><VideoIcon className="h-5 w-5" /></Button> */ }
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
        <Link href={`/profile/${conversation?.participant?.id}`}>

              <DropdownMenuItem>View Profile</DropdownMenuItem>
</Link>
              <DropdownMenuItem onClick={() => handleBlockUser(conversation?.participant?.id)}>Block User</DropdownMenuItem>
             
              <DropdownMenuItem onClick={() => handleClearChat()}>Clear Chat</DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.map((msg) => (
         <MessageItem
  key={msg.id}
  message={msg}
  sender={msg.senderId === user?.uid ? user : conversation.participant}
  isOwnMessage={msg.senderId === user?.uid}
  repliesMap={repliesMap}
  onReply={(msg) => setReplyTo(msg)}
/>
          ))}
        </div>
      </ScrollArea>

      <footer className="border-t p-3 bg-card">
        {isBlocked ? (
          <p>{`You have been blocked by ${conversation?.participant?.fullName}`}</p>
        ) : Blocked ? (
          <p>{`Unblock ${conversation?.participant?.fullName} to chat`}</p>
        ) : (
          <form onSubmit={handleSendMessage} className="flex flex-col gap-1">
            {replyTo && (
              <div className="flex items-center gap-2 p-2 text-sm border rounded-md bg-muted">
                <span className="font-semibold">Replying to:</span>
                <span className="truncate">{replyTo.content}</span>
                <Button variant="ghost" size="icon" onClick={() => setReplyTo(null)}><X className="w-4 h-4" /></Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" type="button" onClick={() => setShowEmojiPicker((prev) => !prev)}>
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <Button variant="ghost" size="icon" type="button" onClick={openFilePicker}>
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  handleTyping();
                  setNewMessage(e.target.value);
                  
                }}



                onBlur={() => {
  if (!user?.uid || !conversation?.id) return;

  const typingRef = doc(
    dbc,
    "conversations",
    conversation.id,
    "typingStatus",
    user.uid
  );

  setDoc(typingRef, { isTyping: false,updatedAt: serverTimestamp()  }, { merge: true });
}}
                className="flex-1 rounded-full bg-muted border-transparent focus-visible:ring-primary focus-visible:ring-1 px-4 py-2"
              />
              <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90">
                <Send className="h-5 w-5 text-primary-foreground" />
              </Button>
            </div>
          </form>
        )}
      </footer>
    </div>
  );
}
