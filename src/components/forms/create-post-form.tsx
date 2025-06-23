"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { currentUser } from "@/lib/dummy-data"; // Assuming currentUser is available
import { useToast } from "@/hooks/use-toast";
import { dbb } from "@/lib/firebase"; // Ensure db is exported from lib/firebase
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { ImageIcon, Video, VideoIcon , MapPin, Smile, X  } from "lucide-react";
export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
const [mediaType, setMediaType] =  useState();
const [feeling, setFeeling] = useState("");
const [locationQuery, setLocationQuery] = useState("");
const [searchResults, setSearchResults] = useState<string[]>([]);

const [showLocationInput, setShowLocationInput] = useState(false)

const [location, setLocation] = useState(""); // Selected location
const feelingsList = ["😊 Happy", "😢 Sad", "😡 Angry", "💪 Motivated"];
const [showFeelings, setShowFeelings] = useState(false)
const handleSelectFeeling = (f: string) => {
  setFeeling(f);
  setShowFeelings(false);
};
  const router = useRouter();
  const { toast } = useToast();
const {user, userData} = useAuth();
  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);

        const type = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
      ? "video"
      : "other"; // fallback

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
        setMediaType(type)
      };
      reader.readAsDataURL(file);
    }
  };



  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    // Reset file input
    const fileInput = document.getElementById('media-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
if (!user) return toast({title:"Please login first"});


  console.log("Auth currentUser:", user?.uid);

  if (!user?.uid) {
    console.warn("User not authenticated.");
    return;
  }
  if (!content.trim() && !mediaFile) return;

  setIsPosting(true);
  let mediaUrl = null;

  try {
    // 1. Upload media to Cloudinary (if provided)
    if (mediaFile) {
      const formData = new FormData();
      formData.append("file", mediaFile);
      formData.append("upload_preset", "PostsM");
      formData.append("folder", "postsmedia");

      const uploadRes = await fetch(
        "https://api.cloudinary.com/v1_1/dpebbtz2z/auto/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();
      mediaUrl = uploadData.secure_url;
    }

              const keywords = content.trim().toLowerCase().split(" ")


  
    // 2. Save post to Firestore
   const newPost = {
  content: content.trim() || null,
  createdAt: Date.now(),
  mediaUrl: mediaUrl || null,
  mediaType: mediaType || null,
  feeling: feeling || null,
  keywords:keywords || null,
  location:location || null,
  uid: user?.uid,   // Make sure this exists and matches the authenticated user!
  author: {
    uid: user?.uid,
    name: userData.fullName,
    username: userData.fullName,
    avatarUrl: currentUser.avatarUrl,
  },
  comments: {},
  likes: [],
  commentsCount: 0,
  likesCount: 0, // ✅ Add this for easier counting

};
console.log("User UID:", user?.uid);
console.log("dataB", newPost);

    await addDoc(collection(dbb, "posts"), newPost);

    toast({
      title: "Post Created!",
      description: "Your post has been successfully shared.",
    });

    router.push("/feed");
  } catch (error) {
    console.error("Post creation failed:", error);
    toast({
      title: "Error",
      description: "Something went wrong while creating your post.",
      variant: "destructive",
    });
  } finally {
    setIsPosting(false);
  }
};


  useEffect(() => {
console.log("location", Location)
    }, [Location])

const fetchLocationSuggestions = async (query: string) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setSearchResults(data.map((place: any) => place.display_name));
  } catch (err) {
    console.error("Location search error:", err);
  }
};


useEffect(() => {
  const timeout = setTimeout(() => {
    if (locationQuery.length > 2) {
      fetchLocationSuggestions(locationQuery);
    }
  }, 300);

  return () => clearTimeout(timeout);
}, [locationQuery]);


  return (
<>
      { userData 
  &&  (



    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
         <Button
                type="button"
                size="icon"
                className="   text-secondary group-hover:opacity-100 bg-primary transition-opacity"
 onClick={() => {
                router.push("/");
              }}              
              >
                <X className="h-4 w-4" />
              </Button>
        <CardTitle className="text-2xl font-headline text-center">Create New Post</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={userData?.avatarUrl} alt={userData?.fullName} data-ai-hint="user avatar" />
              <AvatarFallback>{userData.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{userData.fullName}</p>
              <p className="text-sm text-muted-foreground">@{userData.fullName}</p>
            </div>
          </div>
          <Textarea
            placeholder={`What's on your mind, ${userData.fullName} ?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] text-base resize-none focus-visible:ring-primary"
            required
          />

          {mediaPreview && (
            <div className="relative group">
              <Image src={mediaPreview} alt="Media preview" width={500} height={300} className="rounded-lg object-cover w-full max-h-[300px]" data-ai-hint="upload preview"/>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 group-hover:opacity-100 transition-opacity"
                onClick={removeMedia}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => document.getElementById('media-upload')?.click()}>
              <ImageIcon className="h-5 w-5 mr-1.5 text-green-500" /> Photo/Video
            </Button>
            <Input id="media-upload" type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
            
            {/* <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
              <VideoIcon className="h-5 w-5 mr-1.5 text-blue-500" />  Video
            </Button> */}
          
             <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowLocationInput(true)}>

              <MapPin className="h-5 w-5 mr-1.5 text-red-500" /> Location
            </Button>


{showLocationInput && (
  <div className="mt-2 space-y-2">
    <Input
      placeholder="Search location..."
      value={locationQuery}
      onChange={(e) => setLocationQuery(e.target.value)}
    />
    <ul className="bg-white border rounded max-h-40 overflow-y-auto">
      {searchResults.map((loc, index) => (
        <li
          key={index}
          onClick={() => {
            setLocation(loc);
            setShowLocationInput(false);
            setLocationQuery("");
            setSearchResults([]);
          }}
          className="p-2 hover:bg-gray-100 cursor-pointer text-muted"
        >
          {loc}
        </li>
      ))}
    </ul>
  </div>
)}
{location && (
  <p className="text-sm text-gray-500 mt-1">
    📍 {location}
  </p>
)}          
            <Button onClick={() => setShowFeelings(true)} type="button" variant="ghost" size="sm" className="text-muted-foreground">
             <Smile className="h-5 w-5 mr-1.5 text-yellow-500" /> Feeling/Activity
</Button>

    {feeling && (
  <p className="text-sm text-gray-500 mt-1">
     {feeling}
  </p>
)}  

{showFeelings && (
  <div className="absolute z-50 bg-white border rounded p-2">
    {feelingsList.map((f) => (
      <button
        key={f}
        onClick={() => handleSelectFeeling(f)}
        className="block w-full text-muted text-left hover:bg-gray-100 p-1"
      >
        {f}
      </button>
    ))}
  </div>
)}

          </div>

        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={!content.trim() && !mediaFile}>
            Post
          </Button>
        </CardFooter>
      </form>
    </Card>
        )
       }</> 
  );
}
