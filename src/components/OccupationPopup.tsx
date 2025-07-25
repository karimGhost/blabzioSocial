"use client";

import { useState, useEffect } from "react";
import { addInterest } from "@/utils/saveOccupation";
import { db, dbForums } from "@/lib/firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
export default function OccupationPopup() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    const snapshot = await getDocs(collection(dbForums, "forums"));
    const popular = snapshot.docs
      .map((doc) => ({ name: doc.id, postCount: doc.data().postCount || 0 }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5)
      .map((f) => f.name);

    setTrending(popular);
  };

  const handleAddInterest = async () => {
    const tags = interestInput.split(",").map((t) => t.trim()).filter(Boolean);
    for (const tag of tags) {
      await addInterest(user.uid, tag);
    }
    setInterests((prev) => [...prev, ...tags]);
    setInterestInput("");
    if (tags.length > 0) {
      router.push(`/forums/${tags[0]}`);


    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-2 text-dark" style={{color:"black"}}>What's your field of interest?</h2>
        <p className="text-sm mb-4 text-gray-600">
          Connect with others who share the same occupation or passion. You can add multiple!
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="e.g. software, ai, marketing"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md text-muted"
          />
          <button
            onClick={handleAddInterest}
            className="bg-orange-400 text-white px-4 py-2 rounded-md"
          >
            Save
          </button>
        </div>

        {interests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-muted">Your Interests:</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map((i, idx) => (
                <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-muted" >Trending Forums:</h4>
          <div className="flex gap-2 mt-2 flex-wrap">
            {trending.map((t, i) => (
              <a
                key={i}
                href={`/forums/${t}`}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm"
              >
                #{t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
