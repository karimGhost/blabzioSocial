"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostItem } from "@/components/feed/post-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Post, User,Video } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { VideoItem } from "../video/video-item";
import { formatDistanceToNow } from "date-fns";
interface ProfileTabsProps {
  Blocked: boolean;
  userData: User;
  userPosts: Post[];
  userVids: Video[];
  followers: User[];
  following: User[];
}

export function ProfileTabs({Blocked, userPosts,userVids, userData, followers, following }: ProfileTabsProps) {
const {user} = useAuth() ;
  const [isOnline, setIsOnline] = useState(userData?.privacySettings?.activityStatus);

const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
const handleOpen = (video: any) => setSelectedVideo(video);
const handleClose = () => setSelectedVideo(null);


const [selectedPost, setselectedPost] = useState<any | null >(null);
const handleOpenPost = (post: any) => setselectedPost(post);
const handleClosePost= () => setselectedPost(null);


  const isprivate = userData?.privacySettings?.privateAccount ;

const isNotOwner = userData.uid !== user?.uid;

const isFollowing = following.some((i) => i.id === user?.uid);

const isNotFollowing = !isFollowing;
const shouldRestrictAccess = isNotFollowing && isNotOwner && isprivate ;


useEffect(() =>{
console.log("isNotVid", userVids );
console.log("user", userVids)

}, [userVids])


  if(shouldRestrictAccess ){
  return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Image 
              src="https://placehold.co/400x300.png?text=Private+Account" 
              alt={ `${userData?.fullName} Needs to follow you its Private`}
              width={400} 
              height={300} 
              className="mb-8 rounded-lg shadow-md"
            />
            <h1 className="text-3xl font-bold"> Not Found</h1>
            <p className="text-lg text-muted-foreground">
              Sorry, Not ABle to show you anything <strong>{}</strong>.
            </p>
          </div>
        );

  }


  if(Blocked){
     return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Image 
              src="https://placehold.co/400x300.png?text=Nothing+Shown" 
              alt="Not Able to view Blocked user items" 
              width={400} 
              height={300} 
              className="mb-8 rounded-lg shadow-md"
            />
            <h1 className="text-3xl font-bold"> Not Found</h1>
            <p className="text-lg text-muted-foreground">
              Sorry, Not ABle to show you anything <strong>{}</strong>.
            </p>
          </div>
        );
  }


  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-none sm:rounded-md border-y sm:border">
        <TabsTrigger value="posts">Posts/video</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>




   <TabsContent value="posts" className="mt-6">
  {userPosts.length > 0 || userVids.length > 0 ? (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-1">
        {[

          
          ...userPosts.map((post) => ({ type: "post", data: post, timestamp: post?.timestamp ? formatDistanceToNow(new Date(post.timestamp))  :""}  )),
          ...userVids.map((video) => ({ type: "video", data: video, timestamp: video.timestamp?.toDate ? video.timestamp.toDate() : new Date(video.timestamp)})),
        ]
          .sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime() || 0;
            const timeB = new Date(b.timestamp).getTime() || 0;
            return timeB - timeA;
          })
          .map((item) => {
            const isPost = item.type === "post";

            return (
              <div
                key={item.data.id}
                className="relative aspect-square cursor-pointer"
                onClick={() => {
                  isPost ? handleOpenPost(item.data) : handleOpen(item.data);
                }}
              >
                {isPost ? (
                  <PostItem post={item.data} />
                ) : (
                  <>
                    <video
                      src={item.data.url}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-20 transition" />
                  </>
                )}
              </div>
            );
          })}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full relative">
            <button
              onClick={handleClosePost}
              style={{ zIndex: 100 }}
              className="absolute top-2 right-2 text-white text-2xl font-bold"
            >
              ×
            </button>
            <PostItem post={selectedPost} />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full relative">
            <button
              onClick={handleClose}
              style={{ zIndex: 100 }}
              className="absolute top-2 right-2 text-white text-2xl font-bold"
            >
              ×
            </button>
            <VideoItem video={selectedVideo} containerWidth={340} />
          </div>
        </div>
      )}
    </>
  ) : (
    <Card className="text-center py-12">
      <CardContent>
        <Image
          src="https://placehold.co/300x200.png?text=No+Posts+or+Videos"
          alt="No content illustration"
          width={300}
          height={200}
          className="mx-auto mb-4 rounded-md"
        />
        <h3 className="text-xl font-semibold">No Posts or Videos Yet</h3>
        {userData?.uid === user?.uid ? (
          <p className="text-muted-foreground">Start sharing your content.</p>
        ) : (
          <p className="text-muted-foreground">{`${userData?.fullName} hasn&apos;t shared anything yet.`}</p>
        )}
      </CardContent>
    </Card>
  )}
</TabsContent>


      <TabsContent value="followers" className="mt-6">
        <UserList users={followers} emptyMessage={`${userData?.fullName} doesn't have any followers yet.`} />
      </TabsContent>
    
      <TabsContent value="following" className="mt-6">
        <UserList users={following} emptyMessage={`${userData?.fullName} isn't following anyone yet.`} />
      </TabsContent>
    </Tabs>
  );
}

interface UserListProps {
  users: User[];
  emptyMessage: string;
}

function UserList({ users, emptyMessage }: UserListProps) {
const router = useRouter();


  if (users.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Image src={`https://placehold.co/300x200.png?text=${emptyMessage}`} alt="No users illustration" width={300} height={200} className="mx-auto mb-4 rounded-md" />
          <h3 className="text-xl font-semibold">{"No one To View yet" }</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

 

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((u) => (
        <Card key={u.id} className="overflow-hidden shadow-md">
          <CardContent className="p-4 flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={u.avatarUrl} alt={u.fullName} />
              <AvatarFallback>{u.fullName?.charAt(0) ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Link href={`/profile/${u.id}`} className="font-semibold hover:underline">{u.fullName}</Link>
              <p className="text-sm text-muted-foreground">@{u.fullName}</p>
            </div>
            <Button onClick={() =>  router.push(`/profile/${u.id}`)} variant="outline" size="sm">View</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


