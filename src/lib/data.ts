import { type Post } from './types';

const posts: Post[] = [
  {
    id: '1',
    type: 'image',
    title: 'Future of Urban Mobility: Flying Taxis Take Flight',
    content:
      'In a landmark event, the first commercially certified flying taxi completed its maiden voyage over Dubai. The autonomous electric vehicle represents a giant leap in urban transportation, promising to alleviate traffic congestion and reduce carbon emissions. Experts predict a fleet of these vehicles could be operational in major cities within the next five years.',
    mediaUrl: 'https://placehold.co/600x400.png',
    author: {
      name: 'Jane Doe',
      avatarUrl: 'https://placehold.co/40x40.png',
    },
    createdAt: '2024-07-21T10:00:00Z',
    tags: ['Technology', 'Innovation', 'Transportation', 'Smart Cities'],
    category: 'Tech',
  },
  {
    id: '2',
    type: 'video',
    title: 'Culinary Masterclass: The Art of Sourdough',
    content:
      'Join world-renowned baker Jean-Pierre as he reveals the secrets behind the perfect loaf of sourdough bread. This in-depth video tutorial covers everything from creating and maintaining a starter to achieving that coveted crispy crust and airy crumb. Get your aprons ready for a journey into the heart of artisanal baking.',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video
    author: {
      name: 'John Smith',
      avatarUrl: 'https://placehold.co/40x40.png',
    },
    createdAt: '2024-07-20T14:30:00Z',
    tags: ['Food', 'Baking', 'Lifestyle', 'DIY'],
    category: 'Lifestyle',
  },
  {
    id: '3',
    type: 'text',
    title: 'The Stoic Mind: Finding Calm in a Chaotic World',
    content:
      "In an era of constant connectivity and information overload, the ancient philosophy of Stoicism is experiencing a modern renaissance. This article explores core Stoic principles, such as focusing on what you can control and accepting what you cannot. We'll provide practical exercises to cultivate resilience, mindfulness, and inner peace, transforming daily challenges into opportunities for growth.",
    author: {
      name: 'Emily White',
      avatarUrl: 'https://placehold.co/40x40.png',
    },
    createdAt: '2024-07-19T09:00:00Z',
    tags: ['Philosophy', 'Wellness', 'Mindfulness', 'Self-Improvement'],
    category: 'Wellness',
  },
  {
    id: '4',
    type: 'image',
    title: 'Breakthrough in Sustainable Energy: Algae Bioreactors',
    content:
      'Scientists have developed a new type of bioreactor that uses algae to capture carbon dioxide and produce biofuel with unprecedented efficiency. This innovation could be a game-changer in the fight against climate change, offering a dual solution for carbon sequestration and renewable energy production. The pilot project has already exceeded all performance expectations.',
    mediaUrl: 'https://placehold.co/600x400.png',
    author: {
      name: 'Alex Johnson',
      avatarUrl: 'https://placehold.co/40x40.png',
    },
    createdAt: '2024-07-18T18:00:00Z',
    tags: ['Science', 'Environment', 'Clean Energy', 'Sustainability'],
    category: 'Science',
  },
  {
    id: '5',
    type: 'image',
    title: 'Indie Game "Chrono Weavers" Redefines Puzzle Genre',
    content: 'The latest release from indie studio PixelHeart, "Chrono Weavers," has taken the gaming world by storm. Its unique time-manipulation mechanics combined with a heartfelt story and beautiful pixel art create an unforgettable experience. Critics are hailing it as a masterpiece and a new benchmark for puzzle-adventure games.',
    mediaUrl: 'https://placehold.co/600x400.png',
    author: {
      name: 'Chris Lee',
      avatarUrl: 'https://placehold.co/40x40.png',
    },
    createdAt: '2024-07-17T12:00:00Z',
    tags: ['Gaming', 'Entertainment', 'Indie Games', 'Reviews'],
    category: 'Entertainment'
  },
  {
    id: '6',
    type: 'text',
    title: 'Global Markets React to New Trade Agreements',
    content: 'A sweeping new set of international trade agreements signed this week is sending ripples through global financial markets. While some sectors are poised for significant growth, others face uncertainty. This deep dive analyzes the potential impacts on key industries, stock market trends, and what it means for the average investor.',
    author: {
      name: 'Priya Singh',
      avatarUrl: 'https://placehold.co/40x40.png',
    },
    createdAt: '2024-07-16T22:00:00Z',
    tags: ['Finance', 'Business', 'World Economy', 'Investing'],
    category: 'Business'
  }
];

const trendingTags = ['Technology', 'Innovation', 'Wellness', 'Finance', 'Clean Energy', 'Gaming', 'Lifestyle'];

export function getPosts(): Post[] {
  return posts;
}

export function getPostById(id: string): Post | undefined {
  return posts.find((post) => post.id === id);
}

export function getTrendingTags(): string[] {
  return trendingTags;
}
