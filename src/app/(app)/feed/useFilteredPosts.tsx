import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  doc,
  getDoc,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db, dbb } from "@/lib/firebase";
import type { Post } from "@/lib/dummy-data";

export function useFilteredPosts(user: any, pageSize = 5) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastDocRef = useRef<any>(null);
  const fetchingRef = useRef(false);
  const unsubscribeRef = useRef<any>(null);

  const blockedUidsRef = useRef<Set<string>>(new Set());
  const followingUidsRef = useRef<Set<string>>(new Set());

  /** 🔹 Author cache: avoid duplicate fetches */
  const authorCacheRef = useRef<
    Record<string, { isPrivate: boolean; isPremium: boolean; terminated: boolean }>
  >({});

  /** 🔹 Fetch blocked + following UIDs once */
  const fetchUserLists = useCallback(async () => {
    if (!user?.uid) return;

    const [blockedSnap, followingSnap] = await Promise.all([
      getDocs(collection(doc(db, "users", user.uid), "blocked")),
      getDocs(collection(doc(db, "users", user.uid), "followers")),
    ]);

    blockedUidsRef.current = new Set(blockedSnap.docs.map((d) => d.id));
    followingUidsRef.current = new Set(followingSnap.docs.map((d) => d.id));
  }, [user?.uid]);

  /** 🔹 Get author data (with cache) */
  const getAuthorData = useCallback(async (uid: string) => {
    if (authorCacheRef.current[uid]) {
      return authorCacheRef.current[uid];
    }

    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      authorCacheRef.current[uid] = { isPrivate: false, isPremium: false, terminated: true }; // treat missing user as terminated
      return authorCacheRef.current[uid];
    }

    const data = userDoc.data();
    const authorData = {
      isPrivate: data?.privacySettings?.privateAccount ?? false,
      isPremium: data?.isPremium ?? false,
      terminated: data?.terminated ?? false,
    };

    authorCacheRef.current[uid] = authorData;
    return authorData;
  }, []);

  /** 🔹 Main fetch function */
  const fetchPostsPage = useCallback(
    async (nextPage = false) => {
      if (!user?.uid || fetchingRef.current || !hasMore) return;

      fetchingRef.current = true;
      setLoading(true);

      if (!nextPage) {
        lastDocRef.current = null;
        setHasMore(true);
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        authorCacheRef.current = {}; // clear cache on full reload
      }

      try {
        const postsRef = collection(dbb, "posts");
        let q = query(postsRef, orderBy("createdAt", "desc"), limit(pageSize));
        if (nextPage && lastDocRef.current) {
          q = query(postsRef, orderBy("createdAt", "desc"), startAfter(lastDocRef.current), limit(pageSize));
        }

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setHasMore(false);
          return;
        }

        const rawPosts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];

        /** 🔹 Get unique author IDs */
        const authorUids = Array.from(new Set(rawPosts.map((p) => p.author?.uid).filter(Boolean)));

        /** 🔹 Fetch missing authors (skip cached) */
        const authorEntries = await Promise.all(
          authorUids.map(async (uid) => [uid, await getAuthorData(uid)] as const)
        );

        const authorMap = Object.fromEntries(authorEntries);

        /** 🔹 Filter posts dynamically */
        const visiblePosts = rawPosts
          .filter((post) => {
            const authorId = post.author?.uid;
            if (!authorId) return false;
            if (blockedUidsRef.current.has(authorId)) return false;

            const authorInfo = authorMap[authorId];
            if (authorInfo?.terminated) return false;

            if (user.uid === authorId) return true; // self
            if (!authorInfo?.isPrivate) return true; // public
            return followingUidsRef.current.has(authorId); // private but following
          })
          .map((post) => {
            const authorId = post.author?.uid;
            const isPremium = authorMap[authorId ?? ""]?.isPremium ?? false;
            return { ...post, isPremium, author: { ...post.author, isPremium } };
          });

        /** 🔹 Update pagination reference */
        if (visiblePosts.length > 0) {
          const lastVisibleId = visiblePosts[visiblePosts.length - 1].id;
          const lastVisibleDoc = snapshot.docs.find((d) => d.id === lastVisibleId);
          lastDocRef.current = lastVisibleDoc ?? snapshot.docs[snapshot.docs.length - 1];
        } else {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        setPosts((prev) => (nextPage ? [...prev, ...visiblePosts] : visiblePosts));

        /** 🔹 Real-time listener for new posts */
        if (!nextPage && visiblePosts.length > 0 && !unsubscribeRef.current) {
          const latestTimestamp = visiblePosts[0].createdAt;
          const newPostsQ = query(postsRef, where("createdAt", ">", latestTimestamp), orderBy("createdAt", "desc"));

          unsubscribeRef.current = onSnapshot(newPostsQ, async (snapNew) => {
            const newRaw = snapNew.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
            if (!newRaw.length) return;

            const newAuthorUids = Array.from(new Set(newRaw.map((p) => p.author?.uid).filter(Boolean)));
            const newAuthorEntries = await Promise.all(
              newAuthorUids.map(async (uid) => [uid, await getAuthorData(uid)] as const)
            );

            newAuthorEntries.forEach(([uid, data]) => {
              authorCacheRef.current[uid] = data;
            });

            const filteredNew = newRaw
              .filter((post) => {
                const authorId = post.author?.uid;
                if (!authorId) return false;
                if (blockedUidsRef.current.has(authorId)) return false;

                const authorInfo = authorCacheRef.current[authorId];
                if (authorInfo?.terminated) return false;

                if (user.uid === authorId) return true;
                if (!authorInfo?.isPrivate) return true;
                return followingUidsRef.current.has(authorId);
              })
              .map((post) => {
                const authorId = post.author?.uid;
                const isPremium = authorCacheRef.current[authorId ?? ""]?.isPremium ?? false;
                return { ...post, isPremium, author: { ...post.author, isPremium } };
              });

            if (filteredNew.length) {
              setPosts((prev) => [...filteredNew, ...prev]);
            }
          });
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [user, pageSize, hasMore, getAuthorData]
  );

  useEffect(() => {
    if (!user) return;
    (async () => {
      await fetchUserLists();
      await fetchPostsPage(false);
    })();
  }, [user, fetchUserLists, fetchPostsPage]);

  return { posts, loading, hasMore, loadPosts: () => fetchPostsPage(true) };
}
