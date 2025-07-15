import { Metadata } from 'next';
import { secondAdminDb } from '@/lib/firebase-admin-second';
import { dbb } from '@/lib/firebase';
import PostPageClient from './PostPageClient';

interface Props {
  params: { id: string };
}

// ✅ SERVER-ONLY
export async function generateMetadata({ params }: Props): Promise<Metadata> {

 const snap = await secondAdminDb.collection('posts').doc(params.id).get();
  const post = snap.exists ? snap.data() : null;



  if (!post) return {};

  const title = post.title || "Blabzio Post";
  const description = post.content?.slice(0, 100) || "Check out this post!";
  const image = Array.isArray(post.mediaUrl) && post.mediaUrl.length > 0
    ? post.mediaUrl[0] 
    : 'https://blabzio.vercel.app/android-chrome-192x192.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://blabzio.vercel.app/feed/${params.id}`,
      images: [{ url: image }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

// ✅ SERVER PAGE
export default async function Page({ params }: Props) {
  const snap = await secondAdminDb.collection('posts').doc(params.id).get();
  const post = snap.exists ? snap.data() : null;

  if (!post) return <div className="p-6">Post not found</div>;

  return <PostPageClient post={post} />;
}
