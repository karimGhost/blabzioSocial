"use client"
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { doc, getDoc,setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db , dbb} from "@/lib/firebase";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { Card } from "@/components/ui/card";
import { onSnapshot } from "firebase/firestore";
export default function MyProfilePage() {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [Loading, setLoading] = useState(true);
const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);



useEffect(() => {
  if (!user) return;

  const docRef = doc(db, "users", user.uid);

  const unsubscribe = onSnapshot(docRef, async (docSnap) => {
    if (docSnap.exists()) {
      setUserData({ uid: user.uid, ...docSnap.data() });

  // Fetch posts
        const postsSnap = await getDocs(
          query(collection(dbb, "posts"), where("author.uid", "==", user.uid))
        );

        const posts = postsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserPosts(posts);
      
      try {
        // Fetch followers
        const followersSnap = await getDocs(collection(db, "users", user.uid, "followers"));
        const followerIds = followersSnap.docs.map(doc => doc.id);

        const followerUsers = await Promise.all(
          followerIds.map(async (uid) => {
            const snap = await getDoc(doc(db, "users", uid));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
          })
        );
        setFollowers(followerUsers.filter(Boolean));

        // Fetch following
        const followingSnap = await getDocs(collection(db, "users", user.uid, "following"));
        const followingIds = followingSnap.docs.map(doc => doc.id);

        const followingUsers = await Promise.all(
          followingIds.map(async (uid) => {
            const snap = await getDoc(doc(db, "users", uid));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
          })
        );
        setFollowing(followingUsers.filter(Boolean));
      } catch (err) {
        console.error("Error fetching followers/following:", err);
      }
    }

    setLoading(false);
  });

  return () => unsubscribe();
}, [user]);



  if (loading || Loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found.</div>;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-xl">
        <ProfileHeader
         followers={followers}
        following={following}
        userData={userData} isCurrentUserProfile Blocked={false}   />
      </Card>
      <ProfileTabs
        followers={followers}
        following={following}
        userData={userData} userPosts={userPosts} Blocked={false} />
    </div>
  );
}
