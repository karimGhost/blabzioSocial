"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import EmojiPicker from "emoji-picker-react";
export default function CreateForumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleCreate = async () => {
    const forumRef = doc(db, "forums", name.toLowerCase());

    await setDoc(forumRef, {
      name,
      description,
      emoji,
      createdAt: serverTimestamp(),
      createdBy: user?.uid,
      isPrivate,
      members: [user?.uid],
      moderators: [user?.uid],
      postCount: 0,
    });

    router.push(`/forums/${name.toLowerCase()}`);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4 text-muted">Create a New Forum</h1>

      <label className="block text-sm font-medium mb-1 text-muted">Forum Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-4 text-muted"
        placeholder="e.g. designers, musicians"
      />

      <label className="block text-sm font-medium mb-1 text-muted">Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-4 text-muted"
        rows={3}
        placeholder="What is this forum about?"
      />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl cursor-pointer" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          {emoji}
        </span>
        {showEmojiPicker && (
          <div className="z-50">
            <EmojiPicker onEmojiClick={(e: any) => { setEmoji(e.native); setShowEmojiPicker(false); }} />
          </div>
        )}
        <label className="flex items-center gap-2 text-muted">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Make forum private
        </label>

      </div>

      <button
        onClick={handleCreate}
        className="bg-orange-400 text-white px-4 py-2 rounded w-full"
        disabled={!name}
      >
        Create Forum
      </button>
    </div>
  );
}
