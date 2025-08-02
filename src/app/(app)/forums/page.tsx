"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, doc, getDoc , setDoc} from "firebase/firestore";
import { dbForums } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Earth } from "lucide-react";
import { Select } from "@radix-ui/react-select";
import { SelectGroup } from "@/components/ui/select";

interface Forum {
  headerImageUrl: string;
  adminId: string | undefined;
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  isPrivate: boolean;
  is18Plus: boolean;
  memberCount?: number;
  imageUrl?: string;
  aiHint?: string;
  creatorId?: string;
  createdAt?: { seconds: number };
  moderators: any;
  requests?: string[]; // 👈 ADD THIS
}

const sortOptions = [
  { label: "Latest Created", value: "latest" },
  { label: "Most Members", value: "members" },
];

export default function Home() {
  const { user, userData } = useAuth();
  const [forums, setForums] = useState<Forum[]>([]);
  const [myForums, setMyForums] = useState<Forum[]>([]);
  const [joinedForums, setJoinedForums] = useState<Forum[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [visibleCount, setVisibleCount] = useState(6);
const {toast} = useToast()
  const [moderator, setmoderator] = useState<Forum[]>([]);



const handleRequestToJoin = async (forumId: string, userId: string) => {
  try {

     const Requested = {
      name: userData?.fullName,
      userid: user?.uid,
      avatarUrl: userData?.avatarUrl,
      role: "member",
      joinedAt: Date.now(),
    };
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


const handleJoinPublicForum = async (forumId: string, userId: string) => {
  try {
    const userMember = {
      name: userData?.fullName,
      userid: user?.uid,
      avatarUrl: userData?.avatarUrl,
      role: "member",
      joinedAt: Date.now(),
    };

    // Use userId as the document ID
    await setDoc(
      doc(dbForums, "forums", forumId, "members", userId),
      userMember
    );

    toast({
      title: "Joined",
      description: "You have joined the forum jjjj.",
    });

    // Optionally update state after joining
  } catch (err) {
    console.error("Error joining forum:", err);
    toast({
      title: "Error",
      description: "Could not join the forum.",
    });
  }
};


  useEffect(() => {
  const fetchForums = async () => {
    const snapshot = await getDocs(collection(dbForums, "forums"));

    const allForums = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const forumData = doc.data() as Forum;

        let requests: string[] = [];
        if (user && forumData.isPrivate) {
          const requestsSnapshot = await getDocs(
            collection(dbForums, "forums", doc.id, "requests")
          );
          requests = requestsSnapshot.docs.map((reqDoc) => reqDoc.id);
        }

        return {
          id: doc.id,
          ...forumData,
          requests,
        } as Forum;
      })
    );

    setForums(allForums);

    if (user) {
      const my = allForums.filter((forum) => forum.creatorId === user.uid || forum.adminId === user?.uid);
      const joined = [] as Forum[];

      for (const forum of allForums) {
        if (forum.creatorId === user.uid) continue;

        const memberDoc = await getDoc(
          doc(dbForums, "forums", forum.id, "members", user.uid)
        );

        if (memberDoc.exists()) joined.push(forum);
      }

      const moderator = allForums.filter(
        (forum) =>
          forum.moderators?.includes(user.uid)  


      );
      setMyForums(my);
      setJoinedForums(joined);
      setmoderator(moderator);
    }
  };

  fetchForums();
}, [user]);
  const isNewForum = (createdAt?: { seconds: number }) => {
    if (!createdAt) return false;
    const now = Date.now();
    const created = createdAt.seconds * 1000;
    return now - created < 7 * 24 * 60 * 60 * 1000;
  };

//isCreator  Articles
  const filteredForums = forums
    .filter((forum) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        forum.name.toLowerCase().includes(term) ||
        forum.category.toLowerCase().includes(term);
      const matchesCategory = selectedCategory ? forum.category === selectedCategory || selectedCategory === "My Forums" && forum.adminId === user?.uid  : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "members") {
        return (b.memberCount || 0) - (a.memberCount || 0);
      }
      if (sortBy === "latest") {
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
      return 0;
    });


  const groupedForums = filteredForums.reduce((groups, forum) => {
    if (!groups[forum.category]) groups[forum.category] = [];
    groups[forum.category].push(forum);
    return groups;
  }, {} as Record<string, Forum[]>);

  const use = user?.uid;

  const ForumGrid = ({ title, data }: { title: string; data: Forum[] }) => (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
     {data.slice(0, visibleCount).map((forum) => {
const isCreator = forum.creatorId === user?.uid || forum.adminId === user?.uid;
  const isMember = joinedForums.some(f => f.id === forum.id);

const hasRequested =
  user?.uid && forum.requests?.includes(user.uid) ? true : false;

const isModerator = forum.moderators?.includes(user?.uid) ? true : false;

useEffect(() => {
console.log("mod", forum.moderators?.includes(user?.uid))

}, [forum])
  return (
    <Card key={forum.id} style={{cursor:"pointer"}} className="...">
      
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={forum.headerImageUrl || `https://placehold.co/600x400.png?text=${forum.name}`}
                  alt={forum.name}
                  fill
                  className="object-cover"
                  data-ai-hint={forum.aiHint}
                />
              </div>
                 <div  className="flex gap-1 items-center">
                    <Badge variant="secondary">{forum.category}</Badge>
                    {isNewForum(forum.createdAt) && <Badge className="bg-green-500 text-white">New</Badge>}
                  </div>
              <div className="p-6">
                <div className="flex items-start justify-between">
                
               

                  <div className="flex items-center gap-4">
                    {forum.is18Plus && (
                      <Badge variant="destructive">18+</Badge>
                    )}
                    {forum.isPrivate ? (
                      <span className="flex items-center text-xs text-muted-foreground" title="Private Forum">
                        <Lock className="h-3 w-3 mr-1" /> Private
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-muted-foreground" title="Public Forum">
                        <Earth className="h-3 w-3 mr-1" /> Public
                      </span>
                    )}
                  </div>
                </div>
                <CardTitle className="mt-2 font-headline">{forum.name}</CardTitle>
                <CardDescription className="mt-2 h-12 overflow-hidden">
                  {forum.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                {(forum.memberCount || 0).toLocaleString()} members
              </div>

        <Link  href= {forum.isPrivate && !isCreator && !isMember && !isModerator  ? '' : `/forums/${forum.slug}`}>
         <Button

         variant={
  isCreator
    ? "secondary"
    : isModerator
    ? "ghost"
    : forum.isPrivate
    ? "outline"
    : "default"
}
  disabled={isMember || isCreator || isModerator || hasRequested}
  onClick={() => {
    if (!isMember && !isCreator && !hasRequested) {
      if(!user) return;
      if (forum.isPrivate ) {
        handleRequestToJoin(forum.id, user?.uid); // 👈 Only trigger request
      } else {
        handleJoinPublicForum(forum.id, user?.uid); // You can define this separately
      }
    }
  }}
>
  {isCreator
    ? "My Forum"
    : isModerator
    ? "Moderator"
    : isMember
    ? "Joined"
    : forum.isPrivate
    ? hasRequested
      ? "Request Sent"
      : "Request to Join"
    : "Join Forum"}
</Button>
        </Link>
      </CardFooter>
    </Card>
  );
})}

      </div>
      {data.length > visibleCount && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + 6)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );


  const uniqueCategories = Array.from(new Set(forums.map((f) =>  f.category)));

     useEffect(() => {
console.log("mode", moderator)
     },[moderator])

  return (
    <section className="py-12 md:py-20 lg:py-14">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
            Discover Forums
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search forums..."
              className="border border-gray-300 file:bg-offset-background file:bg-transparent bg-muted rounded-md px-3 py-2 text-sm focus:outline-none background focus:ring-2 focus:ring-orange-400 "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="text-sm border px-2 py-2 rounded-md bg-muted"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option className="bg-muted select:bg-orange-400 active:bg-muted bg-orange-400" key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <Link
              href="/forums/create"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              <Button className="bg-orange-400">Create Forum</Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap mb-4 sticky background top-2 ba z-10 p-2 rounded shadow-sm">
        
        
          <button
            className={`px-4 py-1 border rounded-full text-sm ${selectedCategory === null ? "bg-orange-400 text-white" : "bg-muted "}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
           <button
            className={`px-4 py-1 border rounded-full text-sm ${selectedCategory === "My Forums" ? "bg-orange-400 text-white" : "bg-muted "}`}
            onClick={() => setSelectedCategory("My Forums")}
          >
            My Forums
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-1 border rounded-full text-sm ${selectedCategory === cat ? "bg-orange-400 text-white" : "bg-muted "}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {user && selectedCategory === "My Forums" && (
          <>
            {myForums.length > 0 && <ForumGrid title="My Forums" data={myForums} />}
            {joinedForums.length > 0 && <ForumGrid title="Joined Forums" data={joinedForums} />}
            { moderator.length > 0 &&  moderator  && (
  <ForumGrid title="Moderator In" data={moderator} />
)}
          </>
        )}

        
        {Object.entries(groupedForums).map(([cat, forums]) => (
          <ForumGrid key={cat} title={cat + " Forums"} data={forums} />
        ))}

      </div>
    </section>
  );
}