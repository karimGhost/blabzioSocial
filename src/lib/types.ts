export type Post = {
  id: string;
  type: 'image' | 'video' | 'text';
  title: string;
  content: string;
  mediaUrl?: string; // For image or video URL
  author: {
    name: string;
    avatarUrl: string;
  };
  createdAt: string; // ISO string
  tags: string[];
  category: string;
};
