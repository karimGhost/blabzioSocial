"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getDocs, query, where, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { PostCard, VideoCard, UserCard } from "./search";
import { dbb, db, dbd } from "@/lib/firebase";

const FILTERS = ["All", "Users", "Posts", "Videos"];

export default function SearchResults() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const q = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const filter = searchParams.get("type") ?? "All";

 
  const [loading, setLoading] = useState(true);

  const updateFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", newFilter);
    router.push(`${pathname}?${params.toString()}`);
  };


  type Post = {
  id: string;
  [key: string]: any; // or define full shape if you know it
};

type Video = {
  id: string;
  [key: string]: any;
};

type User = {
  id: string;
  [key: string]: any;
};
const [posts, setPosts] = useState<Post[]>([]);
const [videos, setVideos] = useState<Video[]>([]);
const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!q) return;

    const fetchSearch = async () => {
      setLoading(true);

      try {
        if (["All", "Posts"].includes(filter)) {
          const ps = await getDocs(
            query(collection(dbb, "posts"), where("content", "array-contains", q))
          );
          setPosts(ps.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setPosts([]);
        }

        if (["All", "Videos"].includes(filter)) {
          const vs = await getDocs(
            query(collection(dbd, "videos"), where("description", "array-contains", q))
          );
          setVideos(vs.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setVideos([]);
        }

        if (["All", "Users"].includes(filter)) {
          const us = await getDocs(
            query(
              collection(db, "users"),
              where("fullName", ">=", q),
              where("fullName", "<=", q + "\uf8ff")
            )
          );
          setUsers(us.docs.map(d => ({ id: d.id, ...d.data() })));
// us.docs.forEach((doc) => {
//   console.log("User ID:", doc.id);
//   console.log("User Data:", doc.data());
// });          setUsers([]);

        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [q, filter]);


useEffect(()=>{
console.log("users", users)
},[users])
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Search: <span className="text-primary">{q}</span></h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map(f => (
          <Button
            key={f}
            size="sm"
            variant={f === filter ? "default" : "outline"}
            onClick={() => updateFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {(filter === "All" || filter === "Users") && users.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg mb-2">Users</h2>
              <div className="grid gap-4">{users.map(u => <UserCard key={u.id} user={u} />)}</div>
            </section>
          )}
          {(filter === "All" || filter === "Posts") && posts.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg mb-2">Posts</h2>
              <div className="grid gap-4">{posts.map(p => <PostCard key={p.id} post={p} />)}</div>
            </section>
          )}
          {(filter === "All" || filter === "Videos") && videos.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg mb-2">Videos</h2>
              <div className="grid gap-4">{videos.map(v => <VideoCard key={v.id} video={v} />)}</div>
            </section>
          )}
          {users.length === 0 && posts.length === 0 && videos.length === 0 && (
            <p className="text-muted-foreground">No results found.</p>
          )}
        </>
      )}
    </div>
  );
}
