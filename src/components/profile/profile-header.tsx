"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus, UserCheck, MessageCircle, Bell, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { User } from "@/lib/dummy-data";
import { useFCMPush } from "@/hooks/useFCMPush";
import QRCode from "react-qr-code";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { ProfileBadge } from "./ProfileBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Plus } from "lucide-react"; 

import { useState, useRef } from "react";

import { doc, updateDoc, deleteDoc, setDoc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, dbb, dbd, dbe } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";  
import { MessageButton } from "../MessageButton";
interface ProfileHeaderProps {
    Blocked: boolean;
  userData: User;
    followers: User[]; 
   following: User[];
  isCurrentUserProfile: boolean;
}

export function ProfileHeader({followers, following, Blocked, userData, isCurrentUserProfile }: ProfileHeaderProps) {
  const { user, userD } = useAuth();
const [showShareModal, setShowShareModal] = useState(false);

const [isEditable, setIsEditable] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(userData.avatarUrl);
    const [CoverPhoto, setCoverPhoto] = useState(userData?.CoverPhoto);

const [uploading, setUploading] = useState(false);
const [uploadingC, setUploadingC] = useState(false);

const [isOnline, setIsOnline] = useState(userData?.privacySettings?.activityStatus);

const {toast} = useToast();
  

// const messaging = getMessaging();

const requestPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_PUBLIC_VAPID_KEY",
    });
    console.log("Notification token:", token);
    // Save this token to Firestore under the user document
  } catch (err) {
    console.error("Notification permission denied", err);
  }
};


useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((reg) => console.log('✅ SW registered', reg))
      .catch((err) => console.error('❌ SW error', err));
  }
}, [user]);


const fileInputRef = useRef<HTMLInputElement>(null);

const fileInputCRef = useRef<HTMLInputElement>(null);
  const handleFollowToggle = async () => {
    if (!user?.uid || !userData?.uid) return;
  const followingRef = doc(db, "users", user.uid, "following", userData.uid);
  const followerRef = doc(db, "users", userData.uid, "followers", user.uid);

  if (isFollowing) {
    await deleteDoc(followingRef);
    await deleteDoc(followerRef);
    setIsFollowing(false);
  } else {
    await setDoc(followingRef, { followedAt: Date.now() });
    await setDoc(followerRef, { followedAt: Date.now() });
    setIsFollowing(true);



    await addDoc(collection(dbe, "notifications"), {
  type: "follow",
  fromUser:  user?.uid,
  toUser: userData?.uid,
  username: userD.fullName,
  avatarUrl: userD.avatarUrl,
  timestamp: Date.now(),
  read: false,
});


 const otherUserSnap = await getDoc(doc(db, "users", userData?.uid));

                  const recipientFCMToken = otherUserSnap?.data()?.fcmToken;
                  const newFollower = otherUserSnap?.data()?.notificationSettings?.newFollower;

if (recipientFCMToken && newFollower) {
  try {
    await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: recipientFCMToken,
        title: ` ${userD?.fullName   || "Someone"} Followed you`,
        body:   "You've got a new follower Tap to check ",
       clickAction: `https://blabzio-social.vercel.app/profile/${user?.uid}`,

      }),
    });
    console.log("📩 Notification sent to:", recipientFCMToken);
  } catch (err) {
    console.error("🔥 Failed to send notification:", err);
  }
}

  }
  };

 const handleUnBlock = async (username: string, useris: string) => {
  if (!user) return;

  try {
    await deleteDoc(doc(db, "users", user.uid, "blocked", username));
  toast({
      title: "UN_BLOCKED",
      description:`${username} has been unblocked.`,
    });
location.reload()
  } catch (err) {
    console.error("Unblock failed:", err);
  }
};

const handleBlockUser = async (username: string, useris: string) => {
  if (!user) return;
  try {
    await setDoc(doc(db, "users", user?.uid, "blocked", username), { blockedAt: Date.now() });
    alert();

     toast({
      title: "BLOCKED",
      description:`${useris} has been blocked.`,
      variant: "destructive",
    });
    location.reload()

  } catch (err) {
    console.error("Block failed:", err);
  }
};

const handleMuteUser = async (username: string, useris: string) => {
  if (!user) return;
  try {
    await setDoc(doc(db, "users", user?.uid, "muted", username), { mutedAt: Date.now() });
 toast({
      title: "MUTED",
      description:`${useris} has been muted.`,
    });  } catch (err) {
    console.error("Mute failed:", err);
  }
};


const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files?.[0]) return;
  const file = e.target.files[0];

  if (!file.type.startsWith("image/") ) {
    toast({
      title: "Invalid File",
      description: "Please select a valid image file.",
      variant: "destructive",
    });
    return;
  }

  const public_id = `profiledp/${user?.uid}`;

// 1. Get signed upload details 
const signRes = await fetch("/api/sign-upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ public_id, folder: "profiledp" }),
});

const { timestamp, signature, apiKey, cloudName } = await signRes.json();

const formData = new FormData();
formData.append("file", file);
formData.append("public_id", public_id);
formData.append("folder", "profiledp");
formData.append("overwrite", "true"); // ✅ must match signed fields dark
formData.append("api_key", apiKey);
formData.append("timestamp", timestamp.toString());
formData.append("signature", signature);


  setUploading(true);


  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });


    const data = await res.json();
    if (data.secure_url) {

    setAvatarUrl(data.secure_url);

      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, { avatarUrl: data.secure_url });



        const postsRef = collection(dbb, "posts");

const q = query(postsRef, where("uid", "==", user.uid));

const snapshot = await getDocs(q);

const updates = snapshot.docs.map((postDoc) => {
  return updateDoc(doc(dbb, "posts", postDoc.id), {
      "author.avatarUrl":  data.secure_url,
  });

});

await Promise.all(updates);





 const videoRef = collection(dbd, "videos");

const v = query(videoRef, where("user.uid", "==", user?.uid));

const snapshots = await getDocs(v);

const updated = snapshots.docs.map((postDoc) => {
  return updateDoc(doc(dbd, "videos", postDoc.id), {
      "user.avatarUrl":  data.secure_url,
  });
  
});

await Promise.all(updated);
      }

    

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
    } else {
      throw new Error("No secure URL returned");
    }
  
  } catch (error) {
    console.error("Upload failed", error);
    toast({
      title: "Upload Failed",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  } finally {
    setUploading(false);
  
  }
};


  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };




const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files?.[0]) return;
  const file = e.target.files[0];

  if (!file.type.startsWith("image/") ) {
    toast({
      title: "Invalid File",
      description: "Please select a valid image file.",
      variant: "destructive",
    });
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "profilePic"); //  preset
  formData.append("folder", "profiledp"); //  folder

  formData.append("public_id", `profiledp/${user?.uid}`);
formData.append("overwrite", "true");

  setUploadingC(true);

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dpebbtz2z/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.secure_url) {
      setCoverPhoto(data.secure_url);

      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { CoverPhoto: data.secure_url });
      }

      toast({
        title: "Cover BG Updated",
        description: "Your Cover image  picture has been updated.",
      });
    } else {
      throw new Error("No secure URL returned");
    }
  } catch (error) {
    console.error("Upload failed", error);
    toast({
      title: "Upload Failed",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  } finally {
    setUploadingC(false);
  }
};






   const triggerFileCSelect = () => {
    fileInputCRef.current?.click();
  };


const profileUrl = `https://blabzio.com/profile/${userData.uid}`; 




   


  useEffect(() => {
  const checkFollowing = async () => {
    if (!user?.uid || !userData?.uid) return;

    const ref = doc(db, "users", user.uid, "following", userData.uid);
    const snap = await getDoc(ref);
    setIsFollowing(snap.exists());
  };
  checkFollowing();
}, [userData, user]);



 const isprivate = userData?.privacySettings?.privateAccount;

const isNotOwner = userData.uid !== user?.uid;

const isFollowings = following.some((i) => i.id === user?.uid);

const followBack = following.some((i) => i.id === user?.uid);

const isNotFollowing = !isFollowings;
const shouldRestrictAccess = isprivate && isNotOwner && isNotFollowing;




  return (
    <div className="relative">
      {/* Cover Photo */}
      <div className="h-48 sm:h-64 bg-muted rounded-t-lg overflow-hidden relative"
                  onClick={isCurrentUserProfile && isEditable ? triggerFileCSelect : undefined}

      >
        <Image 

src={CoverPhoto || `https://placehold.co/1200x400.png?text=${userData?.username}'s+Cover`}
          alt={`${userData?.fullName}'s cover photo`} 
          width={1200} 
          height={400} 
          className="w-full h-full object-cover"
          data-ai-hint="profile cover photo" 
        />

 {uploadingC && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    )}

         {isCurrentUserProfile && isEditable && !uploading  &&(
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleCoverChange}
        ref={fileInputCRef}
        className="hidden"
      />
      <div className="absolute bottom-1 right-1 bg-orange-500 rounded-full p-1" style={{cursor:"pointer"}}>
        <Plus className="w-4 h-4 text-white" />
      </div>
    </>
  )}

      </div>


      {/* Profile Info */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 space-y-4 sm:space-y-0 sm:space-x-6">
        
<div className="relative">
  {/* Avatar with click and upload loader overlay message */}
  <Avatar
    className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background rounded-full shadow-lg cursor-pointer "
    onClick={isCurrentUserProfile ? triggerFileSelect : undefined}
  >
    <AvatarImage src={avatarUrl} alt={userData?.fullName} data-ai-hint="user avatar" />
    <AvatarFallback className="text-4xl">
      {(userData?.fullName ?? "").substring(0, 2) || "??"}
    </AvatarFallback>

    {/* Spinner overlay while uploading */}
    {uploading && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    )}
  </Avatar>

  {/* Plus badge when editable */}
  {isCurrentUserProfile && isEditable && !uploadingC && (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        ref={fileInputRef}
        className="hidden"
      />
      <div className="absolute bottom-1 right-1 bg-orange-500 rounded-full p-1" style={{cursor:"pointer"}}>
        <Plus     onClick={isCurrentUserProfile ? triggerFileSelect : undefined}
 className="w-4 h-4 text-white" />
      </div>
    </>
  )}

</div>
          <div className="flex-1 text-center sm:text-left pt-4 sm:pt-0">
            <span className="flex">
                          <h1 className="text-2xl sm:text-3xl font-bold font-headline">{userData?.username}  </h1> 

            { userData.isPremium && <ProfileBadge/>}
            </span>
                         

          
            <p className="text-muted-foreground">@{userData?.fullName}</p>
          </div>
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            {isCurrentUserProfile ? (
              <Button onClick={() => (setIsEditable(pre => !pre))} variant="outline">{isEditable ?  "Exit" : "Edit Profile"}</Button>
            ) : (
             
              

             <>
                {  Blocked ?(
                  <>

                 <Button onClick={() => handleUnBlock(userData.uid, userData.fullName)} style={{background:"red"}} >
                  
                  {"Unblock" }
                </Button>
                {/* <MessageButton targetUserId={userData.uid} unblock /> */}
                </>
             
             ) :(<>
             
            <Button onClick={handleFollowToggle} variant={isFollowing ? "outline" : "default"}>
                  {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {isFollowing ? "Following" : followBack ? "followBack" :  "Follow"}
                </Button>
                
              { shouldRestrictAccess ? <></> : <MessageButton targetUserId={userData.uid} /> }

               </>)}
                </>
            )}
        {Blocked ? <></> :   
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
              
             {user?.uid ? <></> :
 
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Turn on notifications
                </DropdownMenuItem>
}

{
(!user || user.email !== "abdulkarimkassimsalim@gmail.com") ?
           ""
            :

            <DropdownMenuItem style={{background:"red"}}>
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  
                  Terminate Account
                </DropdownMenuItem>
        }
                {!isCurrentUserProfile && (
                  <>
                    <DropdownMenuItem onClick={() => handleMuteUser(userData?.uid, userData?.fullName)}>Mute @{userData?.username}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBlockUser(userData?.uid, userData?.fullName)} className="text-destructive">Block @{userData?.username}</DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
<DropdownMenuItem onClick={() => setShowShareModal(true)}>
  Share Profile
</DropdownMenuItem>   
{user?.uid ? <></> :
  <DropdownMenuItem>Report Profile</DropdownMenuItem>
}           
  
              </DropdownMenuContent>
            </DropdownMenu>

            }
          </div>
        </div>

        {userData?.bio && <p className="mt-4 text-sm text-center sm:text-left">{userData?.bio}</p>}

        <div className="mt-6 flex justify-center sm:justify-start gap-6 text-sm">
          <div><span className="font-semibold">{userData?.postsCount}</span> Posts</div>
          <div><span className="font-semibold">{followers?.length}</span> Followers</div>
          <div><span className="font-semibold">{following?.length}</span> Following</div>
        </div>
      </div>



      {showShareModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-[90%] max-w-sm space-y-4 relative">
      <h2 className="text-lg font-bold text-center">Share Profile</h2>

      <QRCode 
      style={{ background: 'orange'}}
      fgColor="orange"
    
      value={profileUrl} className="mx-auto bgColor" size={128} />

      <div className="flex items-center justify-between bg-muted px-3 py-2 rounded">
        <span className="text-sm truncate">{profileUrl}</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(profileUrl);
            alert("Link copied!");
          }}
          className="text-sm font-medium text-primary"
        >
          Copy
        </button>
      </div>

      <button
        onClick={() => setShowShareModal(false)}
        className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-800"
      >
        ✕
      </button>
    </div>
  </div>
)}
    </div>
  );
}
