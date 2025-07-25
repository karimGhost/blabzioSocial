"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { db, dbForums } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";

type Forum = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  privacy: "public" | "private";
  category: string;
};

export default function ForumsPage() {
  const { user } = useAuth();
  const [myForums, setMyForums] = useState<Forum[]>([]);
  const [trending, setTrending] = useState<Forum[]>([]);
  const [categories, setCategories] = useState<Record<string, Forum[]>>({});

  useEffect(() => {
    if (user?.uid) {
      fetchMyForums();
      fetchTrendingForums();
      fetchByCategories();
    }
  }, [user]);

  const fetchMyForums = async () => {
    const snapshot = await getDocs(query(collection(dbForums, "forums"), where("members", "array-contains", user?.uid)));
    setMyForums(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Forum)));
  };

  const fetchTrendingForums = async () => {
    const snapshot = await getDocs(collection(dbForums, "forums"));
    const forums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Forum));
    const sorted = forums?.sort((a, b) => (b?.postCount || 0) - (a?.postCount || 0)).slice(0, 5);
    setTrending(sorted);
  };

  const fetchByCategories = async () => {
    const snapshot = await getDocs(collection(dbForums, "forums"));
    const forums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Forum));
    const grouped: Record<string, Forum[]> = {};
    forums.forEach(f => {
      if (!grouped[f.category]) grouped[f.category] = [];
      grouped[f.category].push(f);
    });
    setCategories(grouped);
  };

  const renderForumCard = (f: Forum) => (
    <Link
      href={`/forums/${f.id}`}
      key={f.id}
      className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow hover:shadow-md transition w-full sm:w-64"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-2xl">{f.emoji}</span>
        <span className={`text-xs px-2 py-1 rounded ${f.privacy === "private" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
          {f.privacy}
        </span>
      </div>
      <h3 className="text-lg font-semibold">#{f.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{f.description}</p>
    </Link>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Forums</h1>
        <Link href="/forums/create" className="bg-oranfe-400 text-white px-4 py-2 rounded-md ">
          + Create Forum
        </Link>
      </div>

      {myForums.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Your Forums</h2>
          <div className="flex gap-4 flex-wrap">
            {myForums.map(renderForumCard)}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-2">Trending Forums</h2>
        <div className="flex gap-4 flex-wrap">
          {trending.map(renderForumCard)}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Browse by Category</h2>
        {Object.entries(categories).map(([cat, forums]) => (
          <div key={cat} className="mb-4">
            <h4 className="text-sm font-bold mb-1">{cat}</h4>
            <div className="flex gap-4 flex-wrap">{forums.map(renderForumCard)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
