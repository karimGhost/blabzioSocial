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
} from "firebase/firestore";

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
import { MessageSquare, Heart, PlusCircle, UserX, Crown, MoreVertical } from 'lucide-react';
import { DropdownMenuItem,DropdownMenu, DropdownMenuTrigger,DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { dbForums } from '@/lib/firebase';
import { useParams, useRouter } from "next/navigation";

export default function ForumPage() {
  const [forum, setForum] = useState<any>(null);
const params = useParams();
  const slug = params?.slug as string;
const router = useRouter();

const [articles, setArticles] = useState<any[]>([]);
const [members, setMembers] = useState<any[]>([]);
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

      if (forumSnapshot.empty) {
        router.push("/forums");
        return;
      }

      const forumDoc = forumSnapshot.docs[0];
      const forumData = {
        id: forumDoc.id,
        ...forumDoc.data(),
      };

      setForum(forumData);

      // 2. Fetch articles
      const articlesSnapshot = await getDocs(
        collection(dbForums, "forums", forumDoc.id, "articles")
      );
      const articlesData = articlesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArticles(articlesData);

      // 3. Fetch members
      const membersSnapshot = await getDocs(
        collection(dbForums, "forums", forumDoc.id, "members")
      );
      const membersData = membersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(membersData);

      // 4. (Optional) Set admin info from members
      const admin = membersData.find((m) => m.role === "Admin");
      if (admin) {
        setForum((prev) => ({
          ...prev,
          admin,
        }));
      }
    } catch (error) {
      console.error("Error fetching forum data:", error);
    }
  };

  fetchForumData();
}, [slug]);



  const handleViewProfile = (userId: string) => {
  // You could navigate to a user profile page
  router.push(`/users/${userId}`)
}

const toast = useToast();
const handlePromoteToMod = async (userId: string) => {
  try {
    await fetch(`/api/forums/${forum.id}/promote`, {
      method: "POST",
      body: JSON.stringify({ userId }),
      headers: { "Content-Type": "application/json" }
    })
    toast.success("User promoted to moderator!")
    // Re-fetch members if needed
  } catch (err) {
    toast.error("Failed to promote user.")
  }
}

const handleRemoveUser = async (userId: string) => {
  if (!confirm("Are you sure you want to remove this user?")) return

  try {
    await fetch(`/api/forums/${forum.id}/remove`, {
      method: "POST",
      body: JSON.stringify({ userId }),
      headers: { "Content-Type": "application/json" }
    })
    toast.success("User removed from forum.")
    // Re-fetch members if needed
  } catch (err) {
    toast.error("Failed to remove user.")
  }
}

if (!forum) return <div className="container py-12">Loading...</div>;

  return (
   <div>
  {/* --- HERO SECTION WITH ADMIN CONTROLS --- */}
<div className="container py-6">
  <Card className="overflow-hidden">
    {/* Top banner image */}
    <div className="relative h-40 md:h-56 w-full">
      <Image
        src={forum.imageUrl}
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
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
          {forum.name}
        </h1>
        <p className="max-w-2xl mt-2 text-muted-foreground">{forum.description}</p>
        <div className="mt-3">
          <Badge variant="secondary">{forum.category}</Badge>
        </div>
      </div>

      {/* Admin / Mod Controls (currentUser?.role === "Admin" || currentUser?.role === "Moderator") && */}
      { (
        <div className="space-x-2 flex-shrink-0">
          <Button variant="outline">Manage Users</Button>
          <Button className='bg-orange-400'>Edit Forum</Button>
          <Button variant="destructive">Delete Forum</Button>
        </div>
      )}
    </CardContent>
  </Card>
</div>

  {/* --- MAIN CONTENT --- */}
  <div className="container py-8">
    <Tabs defaultValue="articles" className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="members">Members ({forum?.memberCount?.toLocaleString()})</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <Link href={`/forums/${forum.slug}/article/create`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Article
          </Button>
        </Link>
      </div>

      {/* --- ARTICLES TAB --- */}
      <TabsContent value="articles">
        <div className="grid grid-cols-1 gap-6">
         {articles.map((article) => (
            <Card
              key={article.id}
              className="hover:bg-card/90 transition-colors"
            >
              <CardHeader>
                <Link href={`/forums/${forum.slug}/article/${article.slug}`}>
                  <CardTitle className="font-headline text-xl hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </Link>
                <CardDescription>by {article.author.name}</CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4" /> {article.reactions.hearts + article.reactions.likes} Reactions
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" /> {article.commentCount} Comments
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* --- MEMBERS TAB --- */}
      <TabsContent value="members">
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((member) => (

              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-md border bg-background"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member?.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>

                {/*(currentUser.isAdmin || currentUser.isModerator) && member.role !== "Admin" &&*/}
                { (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleViewProfile(member.id)}>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePromoteToMod(member.id)}>
                        Promote to Mod
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemoveUser(member.id)}
                      >
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

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
                    src={forum.admin?.avatarUrl}
                    alt={forum?.admin?.name}
                  />
                  <AvatarFallback>{forum?.admin?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{forum.admin?.name}</span>
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
