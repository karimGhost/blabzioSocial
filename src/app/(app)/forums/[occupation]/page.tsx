"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, dbForums } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import EmojiPicker from "emoji-picker-react";
export default function ForumPage() {
  const { occupation } = useParams();
  const { user, userData } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!occupation) return;
    const q = query(
      collection(dbForums, "forums", occupation, "posts"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    });
    return () => unsub();
  }, [occupation]);

  const handlePost = async () => {
    if (!content.trim()) return;
    await addDoc(collection(dbForums, "forums", occupation, "posts"), {
      uid: user.uid,
      content,
      likes: 0,
      createdAt: serverTimestamp(),
    });
    setContent("");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 capitalize">#{occupation} Forum</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <Textarea
          placeholder="Share something with the community..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-2"
        />
        <div className="flex justify-between items-center">
          <EmojiPicker onSelect={(emoji) => setContent((prev) => prev + emoji)} />
          <Button onClick={handlePost}>Post</Button>
        </div>
      </div>

      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-gray-50 border rounded-xl p-4 mb-4 shadow-sm"
        >
          <p className="mb-2">{post.content}</p>
          <div className="text-sm text-gray-500">Likes: {post.likes}</div>
        </div>
      ))}
    </div>
  );
}
