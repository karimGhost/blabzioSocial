"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc,setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db,dbb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export interface UserData {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  username?: string;
}

export default function UserProfilePage() {
  const { id } = useParams();
const {user} = useAuth();
  const [userData, setUserData] = useState<any | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
//   type UserData = {
//   id: string;
//   uid: string;
//   fullName: string;
//   avatarUrl?: string;
// };

interface UserData {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  username?: string;
}


useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, "users", id as string);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("User not found");
          return;
        }

const userInfo: UserData = {
  id: userSnap.id,
  ...(userSnap.data() as Omit<UserData, "id">),
};        setUserData(userInfo);

        // Fetch posts
        const postsSnap = await getDocs(
          query(collection(dbb, "posts"), where("author.uid", "==", userInfo.uid))
        );

        const posts = postsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserPosts(posts);

        // Fetch followers UIDs
        const followersSnap = await getDocs(collection(db, "users", userInfo.uid, "followers"));
        const followerIds = followersSnap.docs.map(doc => doc.id);

        const followerUsers = await Promise.all(
          followerIds.map(async (uid) => {
            const docSnap = await getDoc(doc(db, "users", uid));
            return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
          })
        );
        setFollowers(followerUsers.filter(Boolean));

        // Fetch following UIDs
        const followingSnap = await getDocs(collection(db, "users", userInfo.uid, "following"));
        const followingIds = followingSnap.docs.map(doc => doc.id);

        const followingUsers = await Promise.all(
          followingIds.map(async (uid) => {
            const docSnap = await getDoc(doc(db, "users", uid));
            return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
          })
        );
        setFollowing(followingUsers.filter(Boolean));
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id]);





useEffect(() => {
  const fetchUser = async () => {
    try {
      const userRef = doc(db, "users", id as string);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const userInfo = { id: snap.id, ...snap.data() } as any;

        // Fetch posts by this user
        const postsSnap = await getDocs(
          query(
            collection(db, "posts"),
            where("author.uid", "==", userInfo.uid)
          )
        );

        const posts = postsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUserPosts(posts);

        // Count followers and following
        const [followersSnap, followingSnap] = await Promise.all([
          getDocs(collection(db, "users", userInfo.uid, "followers")),
          getDocs(collection(db, "users", userInfo.uid, "following")),
        ]);

        setUserData({
          ...userInfo,
          followersCount: followersSnap.size,
          followingCount: followingSnap.size,
        });
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchUser();
}, [id]);


const handleBlockUser = async (username: string) => {
  if (!user) return;
  try {
    await setDoc(doc(db, "users", user.uid, "blocked", username), { blockedAt: Date.now() });
    alert(`${username} has been blocked.`);
  } catch (err) {
    console.error("Block failed:", err);
  }
};

const handleMuteUser = async (username: string) => {
  if (!user) return;
  try {
    await setDoc(doc(db, "users", user.uid, "muted", username), { mutedAt: Date.now() });
    alert(`${username} has been muted.`);
  } catch (err) {
    console.error("Mute failed:", err);
  }
};
  const [isBlocked, setIsBlocked] = useState(false);
  const [Blocked, setBlocked] = useState(false);
const checkBlockedStatus = async (viewerId: string, profileId: string) => {
  const [blockedByThem, youBlockedThem] = await Promise.all([
    getDoc(doc(db, "users", profileId, "blocked", viewerId)),
    getDoc(doc(db, "users", viewerId, "blocked", profileId)),
  ]);

  return {
    isBlocked: blockedByThem.exists(),
    youBlocked: youBlockedThem.exists(),
  };
};


useEffect(() => {
  const checkIfBlocked = async () => {
    if (!user?.uid || !id) return;

    const stringId = Array.isArray(id) ? id[0] : id;

    try {
      const { isBlocked, youBlocked } = await checkBlockedStatus(user.uid, stringId);
      setIsBlocked(isBlocked);
      setBlocked(youBlocked);
    } catch (error) {
      console.error("Error checking block status", error);
    } finally {
      setLoading(false);
    }
  };

  checkIfBlocked();
}, [user?.uid, id]);




   if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Image
          src="https://placehold.co/400x300.png?text=User+Not+Found"
          alt="User not found"
          width={400}
          height={300}
          className="mb-8 rounded-lg shadow-md"
        />
        <h1 className="text-3xl font-bold">User Not Found</h1>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn&apos;t find a profile with ID: <strong>{id}</strong>.
        </p>
      </div>
    );
  }
  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Image 
          src="https://placehold.co/400x300.png?text=User+Not+Found" 
          alt="User not found" 
          width={400} 
          height={300} 
          className="mb-8 rounded-lg shadow-md"
        />
        <h1 className="text-3xl font-bold">User Not Found</h1>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn&apos;t find a profile with ID: <strong>{id}</strong>.
        </p>
      </div>
    );
  }

  const isCurrentUserProfile = userData?.uid === user?.uid; // TODO: match with auth.uid if needed

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-xl">
        <ProfileHeader Blocked={Blocked}
          followers={followers}
        following={following}
        userData={userData} isCurrentUserProfile={isCurrentUserProfile} />
      </Card>
      <ProfileTabs
       Blocked={Blocked}
      userData={userData}
        userPosts={userPosts}
        followers={followers}
        following={following} />
    </div>
  );
}
