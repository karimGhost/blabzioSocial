"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {isValid, formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc, onSnapshot, writeBatch, setDoc } from "firebase/firestore";
import { dbc, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { getUserDoc } from "@/utils/getUserDoc";
import { useUnreadMessages } from "../shared/useUnreadMessages";
import { The_Nautigal } from "next/font/google";
import { currentUser } from "@/lib/dummy-data";

interface ChatSidebarProps {
  setConversation: (conversation: any) => void;

  selectedConversationId?: string;
}



interface UserMeta {
  firstName: any;
  fullName: any;
  id: string;
  name: string;
  avatarUrl?: string;
}

interface ConversationWithMeta {
  id: string;
  participants: string[];
  participant: UserMeta;
  lastMessage: {
    senderId: string;
    content: string;
    timestamp: number;
    isRead: boolean;
  };
}

export function ChatSidebar({
  setConversation,
  selectedConversationId,
}: ChatSidebarProps) {
  
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
const unreadCount = useUnreadMessages(user?.uid);

const [loading, setLoading] = useState(false);


const setRead = async (convId: string) => {
 if(unreadCount === 0) return;
  const userId = user?.uid;
  const q = query(
    collection(dbc, "conversations", convId, "messages"),
    where("receiverId", "==", userId),
    where("isRead", "==", false)
  );





  const snapshot = await getDocs(q);
  const batch = writeBatch(dbc);

  snapshot.forEach((doc) => {
    batch.update(doc.ref, { isRead: true });
  });

  await batch.commit();
}; 

 



useEffect(() => {
  if (!user?.uid) return;

  const q = query(
    collection(dbc, "conversations"),
    where("participants", "array-contains", user.uid)
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const convs = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();

        const otherUserId = data.participants.find((uid: string) => uid !== user.uid);
        if (!otherUserId) return null;

        try {
          const otherUserSnap = await getDoc(doc(db, "users", otherUserId));
          const otherUserData = otherUserSnap.exists() ? otherUserSnap.data() : null;

          return {
            id: docSnap.id,
            participants: data.participants,
            lastMessage: data.lastMessage ?? {},
            participant: { id: otherUserId, ...(otherUserData || {}) },
          };
        } catch (error) {
          console.error("Error fetching user:", error);
          return null;
        }
      })
    );
console.log("conversations", convs)

setConversations(convs.filter(Boolean) as ConversationWithMeta[]);
  });

  return () => unsubscribe();
}, [user]);






const [searchTerm, setSearchTerm] = useState("");

const filteredConversations = conversations.filter((conv) =>
  conv?.participant?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())

);
const listToRender = searchTerm.length > 0 ? filteredConversations : conversations;


const [users, setUsers] = useState<{ id: string; fullName?: string; photoURL?: string }[]>([]);

useEffect(() => {

  console.log("term", searchTerm)
  const runSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);

    try {
      const normalizedSearch = searchTerm.toLowerCase();

      // First: check if any local conversation matches
      const filteredConvos = conversations.filter((conv) =>
        conv?.participant?.fullName?.toLowerCase().includes(normalizedSearch)
      );

      if (filteredConvos.length > 0) {
        // ✅ Matching conversation exists – don't proceed to Firestore
        setUsers([]); // Optional: clear remote results if you show both
        return;
      }

      // 🔍 No match found locally, proceed with Firestore query
      const userQuery = query(
        collection(db, "users"),
        where("keywords", "array-contains", normalizedSearch)
      );

      const userSnapshot = await getDocs(userQuery);
      const foundUsers = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(foundUsers);

    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  runSearch();
}, [searchTerm, conversations]);


const generateConversationId = (uid1: string | undefined, uid2: any) => {
  return [uid1, uid2].sort().join("_");
};

const handleUserClick = async (userId: string | undefined) => {
  if (!user?.uid || !userId) return;

  try {
    const conversationId = generateConversationId(userId, user.uid);
    const conversationRef = doc(db, "conversations", conversationId);
    const snapshot = await getDoc(conversationRef);

    if (!snapshot.exists()) {
      // Conversation does not exist, create it
      const newConversation = {
        id: conversationId,
        participants: [user.uid, userId],
        createdAt: new Date(),
        // Add any other initial fields you want
      };

      await setDoc(conversationRef, newConversation);
      setConversation(newConversation);
      return;
    }

    // Conversation exists — fetch and set as before
    const data = snapshot.data();
    const otherUserId = data.participants.find((id: string) => id !== user.uid);
    const participantDoc = await getUserDoc(otherUserId);
    const participant = { id: otherUserId, ...participantDoc };

    setConversation({
      id: snapshot.id,
      ...data,
      participant,
    });

    // Optional: clear search
    setSearchTerm("");
    setUsers([]);
  } catch (err) {
    console.error("Failed to load or create conversation:", err);
  }
};




  return (
    <div className="flex flex-col border-r bg-muted/20 h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-headline">Messages</h2>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
<Input
  placeholder="Search messages..."
  className="pl-8 rounded-full bg-background"
  value={searchTerm}
  
  onChange={(e) => setSearchTerm(e.target.value)}
/>        </div>
      </div>


      {!loading && searchTerm && users.length > 0 && (
  <div        
 className="absolute z-10 bg-white border rounded shadow w-full max-h-60 overflow-y-auto">
    {users?.map((userd) => (
      <div
        onClick={() => handleUserClick(userd)}
        key={userd?.id}
        style={{background:"black"}}
        className="p-2 flex items-center cursor-pointer bg-dark hover:bg-gray-100"
      >
        <img
          src={userd?.photoURL || "/default-avatar.png"}
          alt={userd?.fullName}
          className="w-8 h-8 rounded-full mr-2"
        />
        <div>
          <div className="font-medium">{userd?.fullName}</div>
          {/* Optional: last message preview or status */}
          <div className="text-sm text-gray-500">{userd?.lastMessage?.text || "No messages yet"}</div>
        </div>
      </div>
    ))}
  </div>
)}
      <ScrollArea className="flex-1">




        <div className="p-2 space-y-1">
 




          {conversations.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">No conversations</p>
          ) : (

listToRender
  .sort((a, b) => {
    const timeA = new Date(a?.lastMessage?.timestamp).getTime() || 0;
    const timeB = new Date(b?.lastMessage?.timestamp).getTime() || 0;
    return timeB - timeA; // Descending: latest first
  }).map((conv) => {
              const isSelected = conv?.id === selectedConversationId;

const lastMessageTimestamp = conv?.lastMessage?.timestamp;
const lastMessageDate = lastMessageTimestamp ? new Date(lastMessageTimestamp) : null;

const lastMessageTime =
  lastMessageDate && isValid(lastMessageDate)
    ? formatDistanceToNow(lastMessageDate, { addSuffix: true })
    : '';              const lastMessageSender = conv?.lastMessage?.senderId === user?.uid ? "You: " : "";

              return (
                <Link  key={conv.id} href={`/messages/${conv.id}`} legacyBehavior>
                  <a onClick={() =>     setRead(conv.id)
}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent/50",
                      isSelected ? "bg-accent text-accent-foreground shadow-sm" : "hover:bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary">
                      <AvatarImage src={conv?.participant?.avatarUrl} alt={conv?.participant.name} />
                      <AvatarFallback>{conv?.participant?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                      <p className="font-semibold text-sm">{conv?.participant?.fullName}</p>
                      <p
                        className={cn(
                          "text-xs truncate",
                          isSelected ? "text-accent-foreground/80" : "text-muted-foreground"
                        )}
                      >
                        {lastMessageSender}
                        {conv?.lastMessage?.content}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground/80 text-right">
                      <p>{lastMessageTime}</p>
                      {!conv?.lastMessage?.isRead && conv?.lastMessage?.senderId !== user?.uid && (
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary"></span>
                      )}
                    </div>
                  </a>
                </Link>
              );
            })
          )} 
        </div>
      </ScrollArea>
    </div>
  );
}
