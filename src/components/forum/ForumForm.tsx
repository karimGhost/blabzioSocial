"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, dbForums } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { slugify } from "@/lib/slugify";
export default function CreateForumPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [category, setCategory] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return <p>Please log in to create a forum.</p>;

  async function createForum() {
    if (!name.trim()) return alert("Name is required");
    setLoading(true);

    const slug = slugify(name);

    try {
      await addDoc(collection(dbForums, "forums"), {
        name,
        slug,
        emoji,
        description,
        privacy,
        category,
        members: [user.uid],
        moderators: [user.uid],
        requests: [],
        isAdult,
        createdAt: new Date(),
        createdBy: user.uid,
      });

      router.push("/forums");
    } catch (e) {
      console.error(e);
      alert("Failed to create forum");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create New Forum</h1>

      <div>
        <label className="block mb-1 font-semibold ">Name</label>
        <input
          className="w-full border p-2 rounded text-muted"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Forum name"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold ">Emoji</label>
        <input
          className="w-20 border p-2 rounded text-center text-muted"
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
          placeholder="Emoji"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold ">Description</label>
        <textarea
          className="w-full border p-2 rounded text-muted"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe your forum"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold ">Category</label>
        <input
          className="w-full border p-2 rounded text-muted"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="Category"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          className="bg-orange-400 "
          id="adult"
          checked={isAdult}
          onChange={e => setIsAdult(e.target.checked)}
        />
        <label className=" bg" htmlFor="adult">18+ (Adult content)</label>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Privacy</label>
        <select
          className="w-full border p-2 rounded text-muted"
          value={privacy}
          onChange={e => setPrivacy(e.target.value as "public" | "private")}
        >
          <option className="text-muted" value="public">Public (Anyone can join)</option>
          <option className="text-muted" value="private">Private (Approval required)</option>
        </select>
      </div>

      <button
        onClick={createForum}
        disabled={loading}
        className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Forum"}
      </button>
    </div>
  );
}
