'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, limit, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { dbForums } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function CreateArticlePage() {
  const { user, userData } = useAuth();
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const {toast} = useToast();

  const [forum, setForum] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAllowed, setIsAllowed] = useState(false);
const [mediaFiles, setMediaFiles] = useState<File[]>([]);
const [mediaURLs, setMediaURLs] = useState<string[]>([]);
const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
const [uploading, setUploading] = useState(false);
async function uploadToCloudinary(file: File, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = 'https://api.cloudinary.com/v1_1/dtdlgromw/upload';
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'FoumUpdate');

    xhr.open('POST', url);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          resolve(res.secure_url);
        } else {
          reject(xhr.responseText);
        }
      }
    };

    xhr.send(formData);
  });
}

  useEffect(() => {
    if (!slug || !user) return;

    const fetchForum = async () => {
      const forumQuery = query(
        collection(dbForums, 'forums'),
        where('slug', '==', slug),
        limit(1)
      );
      const forumSnap = await getDocs(forumQuery);
      if (forumSnap.empty) {
        router.push('/forums');
        return;
      }

      const forumDoc = forumSnap.docs[0];
      const forumData = { id: forumDoc.id, ...forumDoc.data() };

      // Get current user's membership info
      const memberDoc = await getDoc(doc(dbForums, 'forums', forumDoc.id, 'members', user.uid));
      const memberData = memberDoc.exists() ? memberDoc.data() : null;

      // Check permission:
      const isAdmin = memberData?.role === 'Admin';
      const isMod = memberData?.role === 'Moderator';
      const publicCanPost = forumData?.settings?.allowPublicPosting;

      setIsAllowed(isAdmin || isMod || publicCanPost);
      setForum(forumData);
    };

    fetchForum();
  }, [slug, user]);

 const handleSubmit = async () => {
  if (!title || !content || !forum) {
  

  toast({
      title: "Required",
      description:`Title and content are required.`,
    });
    return;
  }

  setUploading(true);
  try {
    const uploadedURLs: string[] = [];

    for (const file of mediaFiles) {
      const url = await uploadToCloudinary(file, (percent) => {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: percent,
        }));
      });
      uploadedURLs.push(url);
    }

    await addDoc(collection(dbForums, 'forums', forum.id, 'articles'), {
      title,
      content,
      createdAt: new Date(),
      author: {
        id: user?.uid,
        name: userData?.fullName,
        avatarUrl: userData?.avatarUrl || '',
      },
      reactions: { hearts: 0, likes: 0 },
      commentCount: 0,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      media: uploadedURLs,
    });
 toast({
      title: "Article created!",
    });
  
    router.push(`/forums/${slug}`);
  } catch (error) {
    console.error(error);
     toast({
      title: "Failed to create article.",
variant: "destructive"
    });
   
  } finally {
    setUploading(false);
  }
};


  if (!forum) return <div className="p-8">Loading forum...</div>;
  if (!isAllowed) return <div className="p-8 text-red-500">You are not allowed to post in this forum.</div>;

  return (
    <div className="container py-10 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">

      <h1 className="text-3xl font-bold">Create Article in {forum.name}</h1>
  <Button
    variant="outline"
    onClick={() => router.push(`/forums/${slug}`)}
  >
    Back to Forum
  </Button>
</div>
      <Input
        placeholder="Article Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Textarea
        rows={10}
        placeholder="Write your article..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
<div>
  <label className="block mb-2 font-medium">Upload Image/Video:</label>
 <Input
  type="file"
  accept="image/*,video/*"
  multiple
  onChange={(e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setMediaFiles((prev) => [...prev, ...newFiles]);
    }
  }}
/>

</div>

{mediaFiles.length > 0 && (
  <div className="grid gap-4 mt-4">
    {mediaFiles.map((file, i) => {
      const url = URL.createObjectURL(file);
      return (
        <div key={i} className="relative">
          <button
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs z-10"
            onClick={() => {
              setMediaFiles((prev) => prev.filter((_, index) => index !== i));
              setUploadProgress((prev) => {
                const copy = { ...prev };
                delete copy[file.name];
                return copy;
              });
            }}
          >
            ✕
          </button>

          {file.type.startsWith('video') ? (
            <video src={url} controls className="rounded-lg max-h-64 w-full" />
          ) : (
            <img src={url} alt="preview" className="rounded-lg max-h-64 w-full" />
          )}
        </div>
      );
    })}
  </div>
)}

{mediaFiles.map((file, i) => (
  <div key={i}>
    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1">
      <div
        className="h-2 bg-orange-400 transition-all duration-300"
        style={{ width: `${uploadProgress[file.name] || 0}%` }}
      />
    </div>
  </div>
))}


      <Button onClick={handleSubmit}>Publish</Button>
    </div>
  );
}
