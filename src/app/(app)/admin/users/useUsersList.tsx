"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db , dbb} from "@/lib/firebase";


export interface User {
   id: string;
  name: string;
  email: string;
  avatarUrl:string;
  fullName: string;
  status:string

}

export interface Author {
  name: string;
  id: string;
}

export interface ContentPost {
  createdAt: any;
  id: string;
  content: string;
  platform: "Instagram" | "Twitter" | "Facebook";
  status: "Pending" | "Approved" | "Rejected";
  author: Author;
  timestamp: number; // Firestore timestamp as number
}
export function useUsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // listen to `users`
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as User)
        )
      );
    });

    // listen to `posts`
    const unsubPosts = onSnapshot(collection(dbb, "posts"), (snapshot) => {
      setContentPosts(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as ContentPost)
        )
      );
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubPosts();
    };
  }, []);

  return {
    users,
    contentPosts,
    loading,
  };
}
