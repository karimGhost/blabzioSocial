"use client";

import { useEffect, useState, useRef } from "react";
import { db, dbd, dbe } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Pencil, Trash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import EmojiPicker from "emoji-picker-react"; // you must install this package
import { string } from "zod";
import { useRouter } from "next/navigation";
interface CommentsModalProps {
  videoId: string;
 authorId:string;

  onClose: () => void;
  isOpen: boolean;
  width?: number; 
setCommentComunt:any
}

interface Comment {
  id: string;
  uid: string;
  text: string;
  name: string;
  avatarUrl: string;
  timestamp: any;
}

export default function CommentsModal({ videoId, authorId, setCommentComunt, onClose, isOpen, width }: CommentsModalProps) {
  const { user, userData } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const commentsRef = collection(dbd, "videos", videoId, "comments");
  const endRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const q = query(commentsRef, orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(list);
      setCommentComunt(list.length)
      console.log("lof", list.length)
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [videoId]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;

    if (editingId) {
      await updateDoc(doc(dbd, "videos", videoId, "comments", editingId), {
        text: newComment,
      });
      setEditingId(null);
    } else {

      await addDoc(commentsRef, {
        text: newComment,
        uid: user.uid,
        name: userData.fullName,
        avatarUrl: userData.avatarUrl,
        timestamp: serverTimestamp(),
      });
    }

 const notificationsRef = collection(dbe, "notifications");
const postId = videoId;
const fromUser = user?.uid;
const toUser = authorId;


const existingQuery = query(
  notificationsRef,
  where("type", "==", "comment"),
  where("fromUser", "==", fromUser),
  where("toUser", "==", toUser),
   where("content", "==", "video"),
  where("postId", "==", postId),
  )


const existingSnapshot = await getDocs(existingQuery);
if(existingSnapshot.empty){
         await addDoc(collection(dbe,  "notifications"), {
    type: "comment",
    content:"video",
    fromUser: user?.uid,
    toUser: authorId,
    postId,
     fullName: userData.fullName ,
    avatarUrl: userData.avatarUrl,
    timestamp:  Date.now(),
    read: false,
  });


}
      const otherUserSnap = await getDoc(doc(db, "users", authorId));
    
                      const recipientFCMToken = otherUserSnap?.data()?.fcmToken;
    
    if (recipientFCMToken) {
      try {
        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: recipientFCMToken,
            title: ` ${userData?.fullName   || "Someone"} commented on your video`,
            body:   "Tap to see!",
           clickAction: `https://blabzio-social.vercel.app/videos/${postId}`,
    
          }),
        });
        console.log("📩 Notification sent to:", recipientFCMToken);
      } catch (err) {
        console.error("🔥 Failed to send notification:", err);
      }
    }


    setNewComment("");
  };


  useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  return () => {
    document.body.style.overflow = "";
  };
}, [isOpen]);

 
const handleDelete = async (commentId: string) => {
  const confirmed = window.confirm("Are you sure you want to delete this comment?");
  if (!confirmed) return;

  try {
    // Example: Firestore delete
    await deleteDoc(doc(dbd, "videos", videoId, "comments", commentId));
    console.log("Comment deleted");
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
};
  const handleEdit = (comment: Comment) => {
    setNewComment(comment.text);
    setEditingId(comment.id);
  };

  const onEmojiClick = (emojiData: any) => {
    setNewComment((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  return (
 
 <>
 {isOpen && (
  <div style={{zIndex:"200"}} className="absolute inset-0 z-200 bg-black/60 flex items-end justify-center">
    {/* Slide-up container */}
    <div
      className={`w-full h-[75%] bg-white rounded-t-2xl flex flex-col p-4 transform transition-transform duration-300 ease-out ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-muted">Comments</h2>
        <Button variant="outline" style={{marginTop:"-20px", marginRight:"-20px"}} size="icon"  onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

     <div className="flex-1 overflow-y-auto space-y-4 pr-2">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2 items-start">
          <img
          onClick={() => router.push(`/profile/${comment.uid}`)}

            src={comment.avatarUrl}
            alt={comment.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="flex-1 break-words">
            <p className="text-sm font-semibold text-muted" style={{cursor:"pointer"}} onClick={() => router.push(`/profile/${comment.uid}`)}> {comment.name}</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap text-muted">{comment.text}</p>
          </div>
          {user?.uid === comment.uid && (
            <div className="flex gap-1">
              <Button size="icon" className="text-muted" onClick={() => handleEdit(comment)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="icon" className="" variant="destructive" onClick={() => handleDelete(comment.id)}>
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>

      {/* Input */}
     <div className="mt-2 flex gap-2 items-end relative">
      <Input
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <Button variant="outline" onClick={() => setShowEmoji(!showEmoji)}>😀</Button>
      <Button onClick={handleSubmit} disabled={!newComment.trim()}>
        {editingId ? "Update" : "Post"}
      </Button>
      {showEmoji && (
        <div className="absolute bottom-14 right-0 z-50">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
    </div>
  </div>
)}

</>
  );
}
