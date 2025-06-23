export type User = {
  uid: any;
  id: string;
  name: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
};

export type Post = {
  comments: any;
  author: any;
  createdAt: string | number | Date;
  id: string;
  userId: string;
  user: User;
  feeling: string;
  location:string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
};

export type Video = {
  id: string;
  userId: string;
  user: User;
  videoUrl: string;
  description: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
};

export type Message = {
  replyToId: any;
  type: string;
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
};

export type Conversation = {
  id: string;
  participant: User;
  lastMessage: Message;
};

export const dummyUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', username: 'alice', avatarUrl: 'https://placehold.co/100x100/D0B4DE/4A4A4A.png?text=A', bio: 'Exploring the digital rabbit hole.', followersCount: 1500, followingCount: 200, postsCount: 50 },
  { id: 'user2', name: 'Bob The Builder', username: 'bob', avatarUrl: 'https://placehold.co/100x100/749F82/FFFFFF.png?text=B', bio: 'Building cool stuff online.', followersCount: 2500, followingCount: 300, postsCount: 120 },
  { id: 'user3', name: 'Charlie Brown', username: 'charlie', avatarUrl: 'https://placehold.co/100x100/F0F0F0/4A4A4A.png?text=C', bio: 'Good grief! Sharing my thoughts.', followersCount: 800, followingCount: 150, postsCount: 30 },
  { id: 'user4', name: 'Diana Prince', username: 'diana', avatarUrl: 'https://placehold.co/100x100/D0B4DE/4A4A4A.png?text=D', bio: 'Advocate for truth and justice.', followersCount: 10000, followingCount: 50, postsCount: 200 },
];

export const currentUser: User = dummyUsers[0]; // Alice as current user

export const dummyPosts: Post[] = [
  {
    id: 'post1',
    userId: 'user2',
    user: dummyUsers[1],
    content: 'Just launched a new project! Check it out. #webdev #coding',
    mediaUrl: 'https://placehold.co/600x400.png',
    mediaType: 'image',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likesCount: 120,
    commentsCount: 15,
    sharesCount: 5,
    isLiked: false,
  },
  {
    id: 'post2',
    userId: 'user3',
    user: dummyUsers[2],
    content: 'My thoughts on the current state of social media. It\'s a wild world out there!',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    likesCount: 75,
    commentsCount: 8,
    sharesCount: 2,
    isLiked: true,
  },
  {
    id: 'post3',
    userId: 'user1',
    user: dummyUsers[0],
    content: 'Enjoying a beautiful sunset today. Grateful for these small moments. 🌅',
    mediaUrl: 'https://placehold.co/600x400.png',
    mediaType: 'image',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    likesCount: 250,
    commentsCount: 30,
    sharesCount: 12,
  },
];

export const dummyVideos: Video[] = [
  {
    id: 'video1',
    userId: 'user4',
    user: dummyUsers[4],
    videoUrl: 'https://placehold.co/360x640.mp4', // Placeholder, not a real video
    description: 'Morning workout routine! 💪 #fitness #motivation',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likesCount: 500,
    commentsCount: 45,
  },
  {
    id: 'video2',
    userId: 'usej5',
    user: dummyUsers[3],
    videoUrl: 'https://placehold.co/360x640.mp4', // Placeholder, not a real video
    description: 'Morning workout routine! 💪 #fitness #motivation',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likesCount: 500,
    commentsCount: 45,
  },
  {
    id: 'video3',
    userId: 'user00',
    user: dummyUsers[2],
    videoUrl: 'https://placehold.co/360x640.mp4', // Placeholder, not a real video
    description: 'Morning workout routine! 💪 #fitness #motivation',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likesCount: 500,
    commentsCount: 45,
  },
  {
    id: 'video4',
    userId: 'user2',
    user: dummyUsers[1],
    videoUrl: 'https://placehold.co/360x640.mp4',
    description: 'Quick demo of my new app feature. So excited! #tech #innovation',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    likesCount: 320,
    commentsCount: 22,
  },
];

export const dummyConversations: Conversation[] = [
    {
    id: 'conv5',
    participant: dummyUsers[5],
    lastMessage: {
      id: 'msg2',
      senderId: 'user1',
      receiverId: 'user3',
      content: 'Yeah, I saw your post. Great stuff!',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: ""
    },
  }, 
  
  {
   
    id: 'conv4',
    participant: dummyUsers[4],
    lastMessage: {
      id: 'msg2',
      senderId: 'user1',
      receiverId: 'user3',
      content: 'Yeah, I saw your post. Great stuff!',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: ""
    },
  },
 
   {
    id: 'conv3',
    participant: dummyUsers[3],
    lastMessage: {
      id: 'msg2',
      senderId: 'user1',
      receiverId: 'user3',
      content: 'Yeah, I saw your post. Great stuff!',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: ""
    },
  },
 
  {
    id: 'conv1',
    participant: dummyUsers[1],
    lastMessage: {
      id: 'msg1',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'Hey, how are you doing?',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      type: ""
    },
  },
  {
    id: 'conv2',
    participant: dummyUsers[2],
    lastMessage: {
      id: 'msg2',
      senderId: 'user1',
      receiverId: 'user3',
      content: 'Yeah, I saw your post. Great stuff!',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: ""
    },
  },
];

export const dummyMessages: Message[] = [
  { id: 'm1', senderId: 'user2', receiverId: 'user1', content: 'Hey, how are you doing?', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 - 5*60000).toISOString(), isRead: false},
  { id: 'm2', senderId: 'user1', receiverId: 'user2', content: 'I am good, thanks! How about you?', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 - 4*60000).toISOString(), isRead: true},
  { id: 'm3', senderId: 'user2', receiverId: 'user1', content: 'Doing great! Working on some new Blabzio features.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 - 3*60000).toISOString(), isRead: false},
];
