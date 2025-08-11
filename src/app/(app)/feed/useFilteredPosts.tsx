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
export function useFilteredPosts(user: any, pageSize = 20) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastDocRef = useRef<any>(null);
  const fetchingRef = useRef(false);
  const unsubscribeRef = useRef<any>(null);

  const blockedUidsRef = useRef<Set<string>>(new Set());
  const followingUidsRef = useRef<Set<string>>(new Set());

  // Fetch blocked + following UIDs for current user  
  const fetchUserLists = useCallback(async () => {
    if (!user?.uid) return;

    const [blockedSnap, followingSnap] = await Promise.all([
      getDocs(collection(doc(db, "users", user.uid), "blocked")),
      getDocs(collection(doc(db, "users", user.uid), "followers")),
    ]);

    blockedUidsRef.current = new Set(blockedSnap.docs.map((d) => d.id));
    followingUidsRef.current = new Set(followingSnap.docs.map((d) => d.id));
  }, [user?.uid]);

  // Main fetch function
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
        const authorUids = Array.from(new Set(rawPosts.map((p) => p.author?.uid).filter(Boolean)));

        const authorDocs = await Promise.all(
          authorUids.map(async (uid) => {
            const userDoc = await getDoc(doc(db, "users", uid));
            const blockedSnap = await getDocs(collection(doc(db, "users", uid), "blocked"));
            return {
              uid,
              exists: userDoc.exists(),
              data: userDoc.data(),
              blockedUids: blockedSnap.docs.map((d) => d.id),
            };
          })
        );

        const authorMap: Record<
          string,
          { isPrivate: boolean; isPremium: boolean; blockedUids: string[]; terminated: boolean }
        > = {};
        authorDocs.forEach((a) => {
          if (a.exists) {
            const data = a.data;
            authorMap[a.uid] = {
              isPrivate: data?.privacySettings?.privateAccount ?? false,
              isPremium: data?.isPremium ?? false,
              blockedUids: a.blockedUids,
              terminated: data?.terminated ?? false,
            };
          }
        });

        const visiblePosts = rawPosts
          .filter((post) => {
            const authorId = post.author?.uid;
            if (!authorId) return false;
            if (blockedUidsRef.current.has(authorId)) return false;
            if (authorMap[authorId]?.blockedUids.includes(user.uid)) return false;
            if (authorMap[authorId]?.terminated) return false;
            if (user.uid === authorId) return true;
            if (!authorMap[authorId]?.isPrivate) return true;
            return followingUidsRef.current.has(authorId);
          })
          .map((post) => {
            const authorId = post.author?.uid;
            const isPremium = authorMap[authorId ?? ""]?.isPremium ?? false;
            return { ...post, isPremium, ispremium: isPremium, author: { ...post.author, isPremium } };
          });

        if (visiblePosts.length > 0) {
          const lastVisibleId = visiblePosts[visiblePosts.length - 1].id;
          const lastVisibleDoc = snapshot.docs.find((d) => d.id === lastVisibleId);
          lastDocRef.current = lastVisibleDoc ?? snapshot.docs[snapshot.docs.length - 1];
        } else {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        setPosts((prev) => (nextPage ? [...prev, ...visiblePosts] : visiblePosts));

        // Attach real-time listener for new posts
        if (!nextPage && visiblePosts.length > 0 && !unsubscribeRef.current) {
          const latestTimestamp = visiblePosts[0].createdAt;
          const newPostsQ = query(postsRef, where("createdAt", ">", latestTimestamp), orderBy("createdAt", "desc"));
          unsubscribeRef.current = onSnapshot(newPostsQ, async (snapNew) => {
            const newRaw = snapNew.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
            if (!newRaw.length) return;

            const newAuthorUids = Array.from(new Set(newRaw.map((p) => p.author?.uid).filter(Boolean)));
            const newAuthorDocs = await Promise.all(
              newAuthorUids.map(async (uid) => {
                const userDoc = await getDoc(doc(db, "users", uid));
                const blockedSnap = await getDocs(collection(doc(db, "users", uid), "blocked"));
                return {
                  uid,
                  exists: userDoc.exists(),
                  data: userDoc.data(),
                  blockedUids: blockedSnap.docs.map((d) => d.id),
                };
              })
            );

            newAuthorDocs.forEach((a) => {
              if (a.exists) {
                const data = a.data;
                authorMap[a.uid] = {
                  isPrivate: data?.privacySettings?.privateAccount ?? false,
                  isPremium: data?.isPremium ?? false,
                  blockedUids: a.blockedUids,
                  terminated: data?.terminated ?? false,
                };
              }
            });

            const filteredNew = newRaw
              .filter((post) => {
                const authorId = post.author?.uid;
                if (!authorId) return false;
                if (blockedUidsRef.current.has(authorId)) return false;
                if (authorMap[authorId]?.blockedUids.includes(user.uid)) return false;
                if (authorMap[authorId]?.terminated) return false;
                if (user.uid === authorId) return true;
                if (!authorMap[authorId]?.isPrivate) return true;
                return followingUidsRef.current.has(authorId);
              })
              .map((post) => {
                const authorId = post.author?.uid;
                const isPremium = authorMap[authorId ?? ""]?.isPremium ?? false;
                return { ...post, isPremium, ispremium: isPremium, author: { ...post.author, isPremium } };
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
    [user, pageSize, hasMore]
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
