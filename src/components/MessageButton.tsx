"use client";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { dbc } from "@/lib/firebase"; // Firestore instance
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from '@/hooks/useAuth';
export function MessageButton({ targetUserId }: { targetUserId: string }) {
  const router = useRouter();
  const { user } = useAuth(); // get current user




  const handleClick = async () => {
    if (!user) return;

    const currentUserId = user.uid;

    // 🔍 Check if conversation already exists
    const q = query(
      collection(dbc, "conversations"),
      where("participants", "array-contains", currentUserId)
    );
    const querySnapshot = await getDocs(q);
    const existingConvo = querySnapshot.docs.find(doc =>
      doc.data().participants.includes(targetUserId)
    );

    let conversationId;
    if (existingConvo) {
      conversationId = existingConvo.id;

    } else {
      // ➕ Create new conversation
      const docRef = await addDoc(collection(dbc, "conversations"), {
        participants: [currentUserId, targetUserId],
        createdAt: serverTimestamp(),
        lastMessage: null,
      });
      conversationId = docRef.id;
    }

    // 🚀 Navigate to the conversation page
    router.push(`/messages/${conversationId}`);
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      <MessageCircle className="mr-2 h-4 w-4" />
      Message
    </Button>
  );
}
