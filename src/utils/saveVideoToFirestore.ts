import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function saveVideoToFirestore(videoUrl: string, user: User, description: string) {
  const videoDoc = {
    url: videoUrl,
    description,
    timestamp: serverTimestamp(),
    user: {
      uid: user.uid,
      name: user.displayName,
      username: user.username,
      avatarUrl: user.photoURL,
    },
    likesCount: 0,
    commentsCount: 0,
  };

  await addDoc(collection(db, "videos"), videoDoc);
}
