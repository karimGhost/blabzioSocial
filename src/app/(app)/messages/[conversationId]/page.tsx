"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { dbc, db } from '@/lib/firebase'; // adjust path
import { doc, getDoc } from 'firebase/firestore';
import { ChatSidebar } from '@/components/message/chat-sidebar';
import { ChatArea } from '@/components/message/chat-area';
import { useAuth } from '@/hooks/useAuth';
import { getUserDoc } from '@/utils/getUserDoc';
import { Button } from '@/components/ui/button';
export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const {user} = useAuth()
  const [conversation, setConversation] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // useEffect(() => {
  //   const fetchConversation = async () => {
  //     const conversationRef = doc(dbc, 'conversations', conversationId);
  //     const snapshot = await getDoc(conversationRef);
  //     if (snapshot.exists()) {
  //       setConversation({ id: snapshot.id, ...snapshot.data() });
  //     } else {
  //       setConversation(null);
  //     }
  //   };

  //   if (conversationId) {
  //     fetchConversation();
  //   }
  // }, [conversationId]);


useEffect(() => {
  if (conversationId) setSidebarOpen(false);
}, [conversationId]);

useEffect(() => {
  const fetchConversation = async () => {
    const conversationRef = doc(dbc, 'conversations', conversationId);
    const snapshot = await getDoc(conversationRef);

    if (!snapshot.exists()) return setConversation(null);

    const data = snapshot.data();
    const otherUserId = data.participants.find((id: string) => id !== user?.uid);
console.log("convo", otherUserId)
    // ✅ fetch user details of the other participant
    const participantDoc = await getUserDoc(otherUserId); // see below
    const participant = { id: otherUserId, ...participantDoc };

    setConversation({
      id: snapshot.id,
      ...data,
      participant, // attach full user data
    });
  };

  if (conversationId) {
    fetchConversation();
  }
}, [conversationId, user]);



  return (
    <div className="h-[calc(100svh-var(--header-height,4rem))]">
      {/* Mobile: toggle sidebar with slide animation */}
      <div className="sm:hidden relative h-full">
        {!conversationId && (
          <div
            className={`fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex justify-end p-3">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ChatSidebar selectedConversationId={conversationId} />
          </div>
        )}

        {conversationId && (
          <ChatArea conversation={conversation} />
        )}

        {!conversationId && (
          <Button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-40"
            variant="outline"
          >
            Open Sidebar
          </Button>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid sm:grid-cols-[320px_1fr] h-full">
        <ChatSidebar selectedConversationId={conversationId} />
        {conversation ? (
          <ChatArea conversation={conversation} />
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
