// src/lib/types/post.ts
export type Post = {
  id: string;
  authorId: string;
  author: {
    uid: string;
    name: string;
    avatarUrl?: string;
  };
  ispremium?: boolean; // match the prop name PostItem expects (ispremium)
  isPremium?: boolean; // keep both just in case code uses either
  comments?: any[];    // define better types if you have them
  userId?: string;
  user?: any;
  content?: string;
  media?: any[];
  mediaUrl?: string;
  mediaType?: string;
  createdAt?: any;
  // allow extra DB fields
  [key: string]: any;
};
