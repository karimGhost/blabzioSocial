'use client'
import Link from 'next/link';
import Image from 'next/image';
import { Toast } from '@radix-ui/react-toast';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  arrayUnion,
  addDoc,
} from "firebase/firestore";
 import { MultiSelectCategory } from '../create/MultiSelectCategory';
import CommentThread from './article/CommentThread';

import TermsPrompt from './settings/TermsPrompt';
 import { useEffect, useState } from 'react';
 import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Heart, PlusCircle, UserX, Crown, MoreVertical, LogOutIcon, Pen, Settings, BadgeCheck, Award, Save, X, Loader2 } from 'lucide-react';
import { DropdownMenuItem,DropdownMenu, DropdownMenuTrigger,DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Admin, dbForums , dbe} from '@/lib/firebase';
import { useParams, useRouter } from "next/navigation";
import ForumMediaSlider from '@/components/feed/ForumMediaSlider';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from './ConfirmDialog';
export default function ForumPage() {
  const [forum, setForum] = useState<any>(null);
const params = useParams();
  const slug = params?.slug as string;
const router = useRouter();
const [isAdmin, setIsAdmin] = useState<boolean>();;
const {user, userData} = useAuth();
const [articles, setArticles] = useState<any[]>([]);
 const [PreviewUrl, setPreviewUrl] = useState();
const [members, setMembers] = useState<any[]>([]);
const [Requests, setRequests] = useState<any[]>([]);

const [Mod, setMod] = useState<any[]>([]);

const [canAddArticle , setcanAddArticle] = useState<boolean>();
useEffect(() => {
  if (!slug) return;

  const fetchForumData = async () => {
    try {
      // 1. Fetch forum by slug
      const forumQuery = query(
        collection(dbForums, "forums"),
        where("slug", "==", slug),
        limit(1)
      );
      const forumSnapshot = await getDocs(forumQuery);
      if (forumSnapshot.empty) return;

      const forumDoc = forumSnapshot.docs[0];
      const forumData = {
        id: forumDoc.id,
        ...forumDoc.data(),
      };
      setForum(forumData);
setcanAddArticle(forumDoc.data()?.settings.allowPublicPosting)
      // 2. Fetch articles
      const articlesSnapshot = await getDocs(
        collection(dbForums, "forums", forumDoc.id, "articles")
      );
      const articlesData = articlesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArticles(articlesData);

      // 🔹 Attach listeners for each article's comments & reactions dark
      articlesData.forEach((art) => {
        const commentsRef = collection(
          dbForums,
          "forums",
          forumDoc.id,
          "articles",
          art.id,
          "comments"
        );

        const reactionsRef = collection(
          dbForums,
          "forums",
          forumDoc.id,
          "articles",
          art.id,
          "reactions"
        );

        // Listen for comments admin
        onSnapshot(commentsRef, (snapshot) => {
          setArticles((prev) =>
            prev.map((a) =>
              a.id === art.id ? { ...a, commentCount: snapshot.size } : a
            )
          );
        });

        // Listen for reactions
        onSnapshot(reactionsRef, (snapshot) => {
  let hearts = 0;
  let likes = 0;
  let userReaction: "heart" | "like" | null = null;

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.type === "heart") hearts++;
    if (data.type === "like") likes++;
    if (docSnap.id === user?.uid) {
      userReaction = data.type;
    }
  });

  setArticles((prev) =>
    prev.map((a) =>
      a.id === art.id
        ? { ...a, reactions: { hearts, likes }, userReaction }
        : a
    )
  );
        });
});

      // 3. Fetch members
      const membersSnapshot = await getDocs(
        collection(dbForums, "forums", forumDoc.id, "members")
      );
      const membersData = membersSnapshot.docs.map((doc) => ({
        id: doc.id,

        ...doc.data(),
      }));
      setMembers(membersData);

      // 4. Fetch moderators exit
      const ModSnap = await getDocs(
        collection(dbForums, "forums", forumDoc.id, "moderators")
      );
      setMod(ModSnap.docs.map((doc) => ({ id: doc.id })));

      // 5. Fetch join requests
      const RequestsSnapshot = await getDocs(
        collection(dbForums, "forums", forumDoc.id, "requests")
      );
      setRequests(
        RequestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      // 6. Set admin info
const admin = forumDoc.data()?.creatorId === user?.uid;
      if (admin) {
        setForum((prev: any) => ({
          ...prev,
          admin,
        }));
        setIsAdmin(admin);
      }
              console.log("admin", user?.uid)

    } catch (error) {
      console.error("Error fetching forum data:", error);
    }
  };

  fetchForumData();
}, [slug, user]);

const handleToggleReaction = async (
  forumId?: string,
  articleId?: string,
  reactionType: "heart" | "like"
) => {
  if (!user?.uid) return;
  if (!forumId || !articleId) {
    console.error("Forum ID or Article ID is missing");
    return;
  }

  const reactionRef = doc(
    dbForums,
    "forums",
    forumId,
    "articles",
    articleId,
    "reactions",
    user.uid
  );

  const reactionSnap = await getDoc(reactionRef);

  if (reactionSnap.exists() && reactionSnap.data().type === reactionType) {
    await deleteDoc(reactionRef);
  } else {
    await setDoc(reactionRef, {
      type: reactionType,
      createdAt: new Date(),
      userId: user.uid
    });
  }
};


  const handleViewProfile = (userId: string) => {
  // You could navigate to a user profile page
  router.push(`/profile/${userId}`)
}

const {toast} = useToast();




const handleRemoveMod = async (forumId:string,userId: string) => {
  try {
    // const userMember = {
    //   name: userId?.name,
    //   userid: userId?.id,
    //   avatarUrl: userId?.avatarUrl,
    //   role: "member",
    //   joinedAt: Date.now(),
    // };

    // 1️⃣ Add user to members
   

        await deleteDoc(doc(dbForums, "forums", forumId, "moderators", userId));

    // 2️⃣ Remove from requests

    toast({
      title: "Approved",
      description: "User has been Removed as moderator.",
    });

    // Optionally refresh state here
  } catch (err) {
    console.error("Error adding Removing:", err);
    toast({
      title: "Error",
      description: "Could not remove the user as Mod",
    });
  }
}

const handlePromoteToMod = async (forumId:string,userId: string) => {
  try {
   
    await setDoc(
      doc(dbForums, "forums", forumId, "moderators", userId),{
            joinedAt: Date.now()
    }
    );

    // 2️⃣ Remove from requests

    toast({
      title: "Approved",
      description: "User has been added as moderator.",
    });

    // Optionally refresh state here
  } catch (err) {
    console.error("Error adding user:", err);
    toast({
      title: "Error",
      description: "Could not add the user as a Mod.",
    });
  }
}

const handleRemoveUser = async (forumId: string,userId: string) => {
  if (!confirm("Are you sure you want to remove this user?")) return

  try {
   
            await deleteDoc(doc(dbForums, "forums", forumId,  userId));

    
        await deleteDoc(doc(dbForums, "forums", forumId, "moderators", userId));


    toast({ title: "success", description: "User removed from forum.." });

    // Re-fetch members if needed
  } catch (err) {
                toast({ title: "Failed",variant:"destructive", description: "Failed to remove user.." });

  }
}




const categoryColors = {
    Science: "bg-blue-500 text-white",
    Technology: "bg-indigo-500 text-white",
    Gaming: "bg-purple-500 text-white",
    Education: "bg-green-500 text-white",
    Health: "bg-emerald-500 text-white",
    Business: "bg-yellow-500 text-black",
    Lifestyle: "bg-pink-500 text-white",
    Entertainment: "bg-red-500 text-white",
    Politics: "bg-orange-500 text-white",
    Other: "bg-gray-500 text-white",
  };

const HandleRequestRemove = async (forumId: string, userId: string) => {
  if (!confirm("Are you sure you want to remove this user request?")) return;

  try {
    await deleteDoc(doc(dbForums, "forums", forumId, "requests", userId));

    toast({
      title: "Success",
      description: "User request removed from forum.",
    });

    // Optional: Update local state here so UI updates instantly
    // setRequests((prev) => prev.filter(req => req.userid !== userId));
  } catch (err) {
    console.error("Error removing user request:", err);
    toast({
      title: "Failed",
      variant: "destructive",
      description: "Failed to remove user request.",
    });
  }
};



const [userAdded, setUserAdded] = useState <any>([])


const handleAddUser = async (forumId: string, userId: any) => {
  try {
    const userMember = {
      name: userId?.name,
      userid: userId?.id,
      avatarUrl: userId?.avatarUrl,
      role: "member",
      AcceptedTerms:false,
      joinedAt: Date.now(),
    };

    // 1️⃣ Add user to members
    await setDoc(
      doc(dbForums, "forums", forumId, "members", userId.id),
      userMember
    );


       await addDoc(collection(dbe, "notifications"), {
        type: "forum",
        fromUser: user?.uid,
        toUser: userId?.id,
        forumId,
         fullName: forum.slug,
        avatarUrl: forum.headerImageUrl || `https://placehold.co/1200x400.png?text=${forum.name}`,
        timestamp:  Date.now(),
        read: false,
      });



setUserAdded((prev: any) => [...prev, userId.id]);

setMembers((prev) => {
  if (prev.some(m => m.userid === userId.id)) return prev; // already exists create
  return [...prev, userId];
});
setRequests((prev) => prev.filter(user => user.id !== userId.id));

    // 2️⃣ Remove from requests
    await deleteDoc(doc(dbForums, "forums", forumId, "requests", userId.id));

    toast({
      title: "Approved",
      description: "User has been added to the forum.",
    });

    // Optionally refresh state here
  } catch (err) {
    console.error("Error adding user:", err);
    toast({
      title: "Error",
      description: "Could not add the user to the forum.",
    });
  }
};


// useEffect(() => {
// console.log("members", members)
// },[members, user])


const [readMoreMap, setReadMoreMap] = useState<{ [postId: string]: number }>({});
// const visibleChars = readMoreMap[post.id] || 500;
// const shouldShowMore = post.content.length > visibleChars;


const handleReadMore = (postId: string, contentLength: number) => {
  setReadMoreMap((prev) => {
    const current = prev[postId] || 500;
    const next = Math.min(current + 800, contentLength); // Don't exceed total length
    return { ...prev, [postId]: next };
  });

};

const handleReaction = async (
  forumId: string,
  article: any,
  type: "hearts" | "likes"
) => {
  if (!user) {
    toast({ title: "Login Required", description: "Sign in to react." });
    return;
  }

  // Prevent duplicate reactions from the same user
  if (article.reactedUsers?.includes(user.uid)) {
    toast({ title: "Already Reacted", description: "You already reacted to this post." });
    return;
  }

  try {
    const articleRef = doc(dbForums, "forums", forumId, "articles", article.id);

    await updateDoc(articleRef, {
      [`reactions.${type}`]: increment(1),
      reactedUsers: arrayUnion(user.uid) // track who reacted
    });

    toast({ title: "Reaction Added", description: `You ${type === "hearts" ? "loved" : "liked"} this post.` });
  } catch (err) {
    console.error("Reaction error:", err);
    toast({ title: "Error", description: "Failed to react to this article." });
  }
};




 const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: forum?.name || "",
    description: forum?.description || "",
    isPrivate: forum?.isPrivate || "",
    category: forum?.category || [], // ✅ This should now be an array
  });

const [edited, setedited] = useState(false);

useEffect(() => {

if(edited)return;

  if (forum) {
  
    setFormData({
      name: forum.name || "",
      description: forum.description || "",
      category: Array.isArray(forum.category) ? forum.category : [],
      isPrivate: forum.isPrivate
    });
  }


}, [forum, isEditing]);

useEffect(() => {
console.log("formData", formData)
},[formData])

  const handleSave = async (formData: { name: any; description: any; category: any; }) => {
 setedited(true)

    try {
      const forumRef = doc(dbForums, "forums", forum.id);
      await updateDoc(forumRef, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        slug:formData.name,
      });
      setIsEditing(false);
      setForum((prev: any) => ({
        ...prev,
 name: formData.name,
        description: formData.description,
        category: formData.category,

        }));
      

    } catch (error) {
      console.error("Error updating forum:", error);
    }
  };



const [exists, setexists] = useState <boolean>()
const [dots, setDots] = useState("");


  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500); // speed of dot animation
    return () => clearInterval(interval);
  }, []);


const [AcceptedTerms, setAcceptedTerms] = useState <boolean>();
const [showTerms, setShowTerms] = useState(false);
 

useEffect(() =>{

setexists(
   !members.some(
    (m) => m?.userid === user?.uid
  )
);
setAcceptedTerms(
  !members.some(
    (m) => m?.userid === user?.uid && m?.AcceptedTerms !== true
  )
);
}, [members, user]);

useEffect(() =>{
console.log("userid", exists)
}, [exists])

useEffect(() => {
  if (!AcceptedTerms && forum?.adminId !== user?.uid) {
    const timer = setTimeout(() => setShowTerms(true), 2000); // 2 second delay
    return () => clearTimeout(timer);
  }
}, [AcceptedTerms, forum, user?.uid]);


const hasRequested =
  user?.uid && forum?.requests?.includes(user.uid) ? true : false;


const handleRequestToJoin = async (forumId: string, userId: string) => {
  try {

     const Requested = {
      name: userData?.fullName,
      userid: user?.uid,
      avatarUrl: userData?.avatarUrl,
      role: "member",
      joinedAt: Date.now(),
      AcceptedTerms: false 

  }
    await setDoc(
      doc(dbForums, "forums", forumId, "requests", userId),
     Requested
    );
    toast({ title: "Request Sent", description: "Your request to join has been sent." });
  } catch (err) {
    console.error("Error sending join request:", err);
    toast({ title: "Error", description: "Could not send request. Try again later." });
  }

}



const ExitForum = async (forumId: string, userId: any) => {


  try {
    await deleteDoc(doc(dbForums, "forums", forumId, "members", userId));
  router.push("/forums");
    toast({
      title: "Success",
      description: "you have exited the forum .",
    });

  
    // Optional: Update local state here so UI updates instantly verify
    // setRequests((prev) => prev.filter(req => req.userid !== userId));
  } catch (err) {
    console.error("Error  request:", err);
    toast({
      title: "Failed",
      variant: "destructive",
      description: "Failed to remove .",
    });
  }
};







const HandleRemoveuser = async (forumId: string, userId: any) => {

  try {
    await deleteDoc(doc(dbForums, "forums", forumId, "requests", userId));

    toast({
      title: "Success",
      description: "you are removed from forum for not accepting the terms .",
    });

    // Optional: Update local state here so UI updates instantly verify
    // setRequests((prev) => prev.filter(req => req.userid !== userId));
  } catch (err) {
    console.error("Error removing request:", err);
    toast({
      title: "Failed",
      variant: "destructive",
      description: "Failed to remove .",
    });
  }
};

  const [dot, setDot] = useState("");

  const [showVerifying, setShowVerifying] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    setShowVerifying(false);
  }, 5000); // 5 seconds

  return () => clearTimeout(timer); // cleanup
}, []);


  useEffect(() => {
    if(exists){
    const t = setInterval(() => setDot((d) => (d.length < 3 ? d + "!" : "")), 450);

    return () => clearInterval(t);
    }
  }, [exists]);

function VerifyingMember() {
    const [dots, setDots] = useState("");

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length < 3 ? d + "." : "")), 450);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-6 mx-auto max-w-md rounded-xl bg-gradient-to-r from-gray-900/80 to-black/60 backdrop-blur-md p-5 text-center text-white shadow">
      <div className="flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />

      {  <div className="text-lg font-semibold"> Verifying if you are a Member{dots}</div> }
      </div>
      <p className="mt-2 text-sm text-gray-300"> Request status will appear here  shortly. </p> 
    </div>
  );
}

const isMember = members.some((m) => m.id === user?.uid);


if (user && forum?.isPrivate && !isAdmin && !isMember) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900">
      <div className="absolute inset-0 backdrop-blur-sm opacity-80 bg-black" />

      <div className="relative z-10 text-center p-6 rounded-xl bg-gray-800 shadow-lg max-w-sm w-full">
        <h1 className="text-white text-xl font-semibold mb-2">Private Forum</h1>

        <h2>
          {hasRequested
            ? `Request pending ${dots}`
            : `You are not a member ${dot}`}
        </h2>

        <div className="text-sm font-medium">
    {!isMember && showVerifying && <VerifyingMember />}
        </div>

        <p className="text-gray-400 mb-4">
          This forum is private. You must be a member to view content.
        </p>
{!isMember &&
        <button
          onClick={() => handleRequestToJoin(forum.id, user?.uid)}
          className="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-300 transition"
          disabled={hasRequested}
        >
          {hasRequested ? "Pending Approval" : "Request to Join"}
        </button>}
      </div>
    </div>
  );
}

const handleUpdateUser = async (forumId: string, userId: any) => {
  try {
    await setDoc(
      doc(dbForums, "forums", forumId, "members", userId),
      { AcceptedTerms: true }, 
      { merge: true } 
    );

setShowTerms(false);
    console.log("User accepted terms");
  } catch (error) {
    console.error("Error updating user terms:", error);
  }
};




// if(!AcceptedTerms && forum.adminId !== user?.uid){

//    return (<TermsPrompt
//   hasAcceptedTerms={AcceptedTerms}
//   onAccept={() => {
//    handleUpdateUser(forum.id, user?.uid)

//   }}
//   onReject={() => {
//     // remove member from forum
//     HandleRemoveuser()
//   }}
// />
//    )
// }


  

if(showTerms && forum?.isPrivate && forum?.adminId !== user?.uid){
  return(
 <TermsPrompt
    hasAcceptedTerms={AcceptedTerms}
    terms={forum?.settings?.rules}
    onAccept={() => handleUpdateUser(forum?.id, user?.uid)}
    onReject={() =>{ HandleRemoveuser( forum?.id, user?.uid); router.push("/forums")}} 
  />
  )
}

// {showTerms && forum.adminId !== user?.uid &&(
//   <TermsPrompt
//     hasAcceptedTerms={AcceptedTerms}
//     onAccept={() => handleUpdateUser(forum.id, user?.uid)}
//     onReject={() =>{ HandleRemoveuser( forum.id, user?.uid); router.push("/forums")}} 
//   />

// )}

if (!forum) return <div className="container py-12">Loading...</div>;

  return (
   <div>
  {/* --- HERO SECTION WITH ADMIN CONTROLS --- */}
<div className="container py-6">
  <Card className="overflow-hidden">
    {/* Top banner image */}
    <div className="relative h-40 md:h-56 w-full">
      <Image
                  src={forum.headerImageUrl || `https://placehold.co/1200x400.png?text=${forum.name}`}
        alt={forum.name}
        fill
        className="object-cover"
        data-ai-hint={forum.aiHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
    </div>

    {/* Card content below image */}
    <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-6 py-6">
      {/* Forum Info */}
      <div className="flex flex-col">
        {isEditing ? (
        <>
          {/* Editable fields */}
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))

            }
            placeholder='change name'
          />

          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Forum Description"
          />

          {/* MultiSelectCategory instead of Input */}
          <MultiSelectCategory
            value={formData.category}
            onChange={(newCategories: any) =>
              setFormData((prev) => ({ ...prev, category: newCategories }))
            }
          />

          <div className="flex gap-2">
            <Button
              onClick={() => {
                handleSave(formData);
                setIsEditing(false);
              }}
              className="bg-orange-500 text-white"
            >
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            <Button
              variant="outlined"
              className='outline'
              onClick={() => {setedited(false); setIsEditing(false)}}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Display mode */}
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
            {formData.name}
          </h1>
          <p className="max-w-2xl mt-2 text-muted-foreground">
            {formData.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {Array.isArray(formData.category) &&
              formData.category.map((cat: string) => (
                <Badge
                  key={cat}
                  className={`${categoryColors[cat] || "bg-gray-500 text-white"} text-xs font-medium`}
                >
                  {cat}
                </Badge>
              ))}
          </div>
        </>
      )}

      </div>

      {/* Admin / Mod Controls (currentUser?.role === "Admin" promote    requests edit || currentUser?.role === "Moderator") settings && */}
     {  forum.adminId === user?.uid  ? (
  <div className="space-x-2 flex-shrink-0">
     {/* Edit Button */}
     
  
   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>

                      <DropdownMenuItem>
                        <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>

                       <Button
          className=" bg-transparent hover:bg-orange-300"
          onClick={() => setIsEditing(true)}
        >
          Edit Forum
          <Pen className="ml-1 h-4 w-4" />
        </Button>
     
    {/* <Button variant="destructive">Delete Forum</Button> */}
    <Button className=" hover:bg-orange-300" onClick={() => router.push(`/forums/${forum.id}/settings`)}>
      Forum Settings
      <Settings />
    </Button>    
                        </div>
    

        </DropdownMenuItem>
                      
                      </DropdownMenuContent>
                      </DropdownMenu>
                   
    
    
  </div>
) : <div className="space-x-2 flex-shrink-0">
  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem >

   <ConfirmDialog
      title="Leave Forum"
  description="Are you sure you want to leave this forum? You’ll lose access to all discussions."
  confirmText="Leave Forum"
  cancelText="Stay"
      trigger={
         <button
    
      className="flex px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
    >
      Exit Forum <LogOutIcon />
    </button>
       
      }
  onConfirm={() => ExitForum(forum?.id, user?.uid)}  // ✅ wrap it
          

    />


                      </DropdownMenuItem>
                      
                      </DropdownMenuContent>
                      </DropdownMenu>
                   
  </div>}


    </CardContent>
  </Card>
</div>

  {/* --- MAIN CONTENT --- */}
  <div className="container py-8">
    <Tabs defaultValue="articles" className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="members">Members ({members?.length})</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>

{forum.isPrivate && ((forum.adminId === user?.uid) || Mod.some(i => i.id === user?.uid)) && (
  <TabsTrigger value="Requests">Requests</TabsTrigger>
)}
        </TabsList>


       { ((forum.adminId === user?.uid) || Mod.some(i => i.id === user?.uid))  ?
       <Link href={`/forums/${forum.slug}/article/create`}>
        
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create
          </Button>
        
        </Link> 
:
      forum.isPrivate ? canAddArticle  && <Link href={`/forums/${forum.slug}/article/create`}>
        
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create
          </Button>
        
        </Link> 
        :
          canAddArticle && <Link href={`/forums/${forum.slug}/article/create`}>
        
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create
          </Button>
        
        </Link>
        
          
        

      }
      </div>

      {/* --- ARTICLES TAB about--- */}
    <TabsContent value="articles">
  <div className="grid grid-cols-1 gap-6">

{[...articles]
  .sort((a, b) => {
    const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
    const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
    return dateB - dateA; // newest first
  })
  .map((article) => (      <Card
        key={article.id}
        className="hover:bg-caprimarytransition-colors"
      >
        <CardHeader>
          <Link href={`/forums/${forum.slug}/article/${article.slug}`}>
            <CardTitle className="font-headline text-xl hover:text-primaryy transition-colors">
              {article.title}
            </CardTitle>
          </Link>
          <div className="flex items-center gap-2">
            {article.author.avatarUrl && (
              <img
                src={article.author.avatarUrl}
                alt={article.author.name}
                className="w-6 h-6 rounded-full"
              />



            )}
<CardDescription>
  by {article.author.name} ·{" "}
  {article.createdAt
    ? formatDistanceToNow(
        article.createdAt.toDate
          ? article.createdAt.toDate() // Firestore Timestamp
          : new Date(article.createdAt), // Already a string/number
        { addSuffix: true }
      )
    : ""}
</CardDescription>
          </div>
        </CardHeader>

        {article.media?.length > 0 && (
          <div className="px-6 pb-4">
          

            <ForumMediaSlider post={article.media}  setPreviewUrl={setPreviewUrl}/>
          </div>
        )}
             <CardContent className="p-4 pt-0">

<p className="whitespace-pre-wrap text-sm">
  {article.content.slice(0, readMoreMap[article.id] || 500)}
  {article.content.length > readMoreMap[article.id] && (
    <button
      onClick={() => handleReadMore(article.id, article.content.length)}
      className="text-blue-500 underline ml-1"
      style={{ cursor: 'pointer' }}
    >
      ...Read More
    </button>
  )}
</p>
            </CardContent>

    <CardFooter className="flex items-center gap-6 text-sm text-muted-foreground">
  <button
    className={`flex items-center gap-1.5 ${
      article.userReaction === "heart" ? "text-red-500" : ""
    }`}
onClick={() => handleToggleReaction(forum?.id, article?.id, "heart")}
  >
    <Heart className="h-4 w-4" />
    {article.reactions?.hearts || 0}
  </button>

  <button
    className={`flex items-center gap-1.5 ${
      article.userReaction === "like" ? "text-blue-500" : ""
    }`}
onClick={() => handleToggleReaction(forum?.id, article?.id, "like")}
  >
    👍 {article.reactions?.likes || 0}
  </button>

  <div className="flex   items-center gap-1.5">
 <CommentThread forumId={forum.id} articleId={article.id} />
  </div>
</CardFooter>
      </Card>
    ))}
  </div>
</TabsContent>


      {/* --- MEMBERS TAB Articles  --- */}
      <TabsContent value="members">
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((member) => (

              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-md border bg-background"
              >
                <div className="flex items-center gap-3" onClick={() => handleViewProfile(member.id)}>
                  <Avatar>
                    <AvatarImage src={member?.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${member.id}`} className="font-semibold">{member.name}</Link>
<div style={{display:"flex", flexDirection:"row"}}>
    { member?.role === "Admin"  &&   <Crown className="h-3 w-3 text-amber-500" /> }
    { member?.role === "Moderator"  &&   <Badge className="h-3 w-3 text-amber-500" /> }
<div className='flex'>

   <p className="text-xs text-muted-foreground">{member?.id === forum?.adminId  ? "Admin " :  Mod.some(i => i.id === member?.id) ? "Moderator"  : "Member"}</p>

                 { Mod.some((i) => i.id === member.id) &&   <Award className="h-3 w-3 text-amber-500" />}
</div>
                   
</div>
                
                  </div>
                </div>

                {/*(currentUser.! || currentUser.isModerator) crown && member.role user !== "Admin" settings members &&*/}
                { member?.role !== "Admin"  &&(
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem style={
                        
                        {cursor:"pointer"}
                      } className='pointer-cursor hover:text-primary' onClick={() => handleViewProfile(member.id)}>
                        View Profile
                      </DropdownMenuItem>
                   {forum.adminId === user?.uid && ( 
  <DropdownMenuItem
    className="cursor-pointer hover:text-primary"
    onClick={() => handlePromoteToMod(forum.id, member.id)}
  >
    Promote to Mod
  </DropdownMenuItem>

)}

{forum.adminId === user?.uid&& ( 
  <DropdownMenuItem
    className="cursor-pointer hover:text-primary"
    onClick={() => handleRemoveMod(forum.id, member.id)}
  >
    Remove Mod
  </DropdownMenuItem>
)}
                   {((forum.adminId === user?.uid) || Mod.some(i => i.id === user?.uid))   &&   <DropdownMenuItem
                      style={
                        
                        {cursor:"pointer", borderRadius:"5px"}
                      }  className="text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleRemoveUser(forum.id,member.id)}
                      >
                        Remove User
                      </DropdownMenuItem>
}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>



       {/* --- MEMBERS Requests TAB Articles --- */}
     {forum.isPrivate && ((forum.adminId === user?.uid) || Mod.some(i => i.id === user?.uid)) && 
      <TabsContent value="Requests">
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Requests.map((member) => (

              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-md border bg-background"
              >
                <div className="flex items-center gap-3" onClick={() => handleViewProfile(member.id)}>
                  <Avatar>
                    <AvatarImage src={member?.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div style={{cursor:"pointer"}}>
                    <Link href={`/profile/${member.id}`} className="font-semibold">{member.name}</Link>
                    {/* <p className="text-xs text-muted-foreground">{  Mod.some((i) => i.id === member.id)   ? "Moderator" : "Member"}</p> */}
                  </div>
                </div>

                {/*(currentUser.! || currentUser.isModerator) && member.role exit user !== "Admin" exit &&*/}
                { (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem style={
                        
                        {cursor:"pointer"}
                      } className='pointer-cursor' onClick={() => handleViewProfile(member.id)}>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className='cursor-pointer' onClick={() => handleAddUser( forum.id,member)}>
                       {userAdded.includes(member.id) ? "added" : "AddUser"}
                      </DropdownMenuItem>


                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => HandleRequestRemove(forum.id, member.id)}
                      >
                        Remove Request
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
}
      {/* --- ABOUT TAB --- */}
      <TabsContent value="about">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">About {forum.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{forum.description}</p>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <p className="font-semibold">Admin:</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={members.find((i) => i.id === forum.adminId)?.avatarUrl}
                    alt={members.find((i) => i.id === forum.adminId)?.name}
                  />
                  <AvatarFallback>{ members.find((i) => i.id === forum.adminId)?.name.charAt(0) }</AvatarFallback>
                </Avatar>
                <span style={{cursor:"pointer"}} onClick={() => router.push(`/profile/${members.find((i) => i.id === forum.adminId).id}`)}>  {members.find((i) => i.id === forum.adminId)?.name }</span>
              </div>
            </div>
            <div>
              <Badge variant="secondary">{forum.category}</Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</div>

  );
}
