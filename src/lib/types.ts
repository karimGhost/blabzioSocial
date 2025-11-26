import { LucideIcon } from "lucide-react";

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


export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Moderator' | 'User';
  status: 'Active' | 'Banned' | 'Pending';
  lastLogin: string;
};



export type ContentPost = {
  id: string;
  author: Pick<any, 'name' | 'avatar'>;
  platform: 'Facebook' | 'Twitter' | 'Instagram';
  content: string;
  mediaUrl?: string;
  timestamp: string;
  status: 'Approved' | 'Rejected' | 'Pending';
};

export type ScheduledPost = {
  id: string;
  platform: 'Facebook' | 'Twitter' | 'Instagram';
  content: string;
  scheduledTime: Date;
  status: 'Scheduled' | 'Posted' | 'Error';
};


export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

