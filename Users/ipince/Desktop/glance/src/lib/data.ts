
import type { User, Glance, Comment } from './types';

export const users: User[] = [
  { id: 'u1', name: 'Alex Johnson', username: 'alexj', bio: 'Exploring the world one photo at a time. Tech enthusiast and coffee lover.', avatarUrl: 'https://picsum.photos/seed/avatar1/100/100', interests: ['Photography', 'Technology', 'Travel'] },
  { id: 'u2', name: 'Brenda Smith', username: 'brendas', bio: 'Software engineer by day, chef by night. Building cool things and baking delicious treats.', avatarUrl: 'https://picsum.photos/seed/avatar2/100/100', interests: ['Cooking', 'Coding', 'Baking'] },
  { id: 'u3', name: 'Charlie Brown', username: 'charlieb', bio: 'Nature is my therapy. Hiking, camping, and living for the next adventure.', avatarUrl: 'https://picsum.photos/seed/avatar3/100/100', interests: ['Hiking', 'Nature', 'Adventure'] },
  { id: 'u4', name: 'Diana Prince', username: 'dianap', bio: 'Art, history, and mythology. Curator of beautiful things.', avatarUrl: 'https://picsum.photos/seed/avatar4/100/100', interests: ['Art', 'History', 'Museums'] },
];

const comments: Record<string, Comment[]> = {
  g1: [
    { id: 'c1', author: users[1], content: 'Wow, amazing shot!', createdAt: '2023-10-26T10:00:00Z' },
    { id: 'c2', author: users[2], content: 'I wish I was there!', createdAt: '2023-10-26T10:30:00Z' },
  ],
  g2: [
    { id: 'c3', author: users[0], content: 'Congrats on the launch!', createdAt: '2023-10-26T05:00:00Z' },
  ],
  g3: [
    { id: 'c4', author: users[3], content: 'Looks so peaceful.', createdAt: '2023-10-25T12:00:00Z' },
    { id: 'c5', author: users[0], content: 'What trail is this?', createdAt: '2023-10-25T15:00:00Z' },
    { id: 'c6', author: users[2], content: 'It\'s the "Eagle Peak" trail. Highly recommend!', createdAt: '2023-10-25T16:00:00Z' },
  ],
  g4: [],
  g5: [
    { id: 'c7', author: users[0], content: 'I need to check this out.', createdAt: '2023-10-23T18:00:00Z' },
  ],
};


export const glances: Glance[] = [
  {
    id: 'g1',
    author: users[0],
    content: 'Just captured this stunning sunset over the mountains. The colors were absolutely unreal! #nature #photography #sunset',
    mediaUrl: 'https://picsum.photos/seed/glance1/600/400',
    mediaType: 'image',
    createdAt: '2023-10-26T12:00:00Z',
    likes: 152,
    comments: comments.g1,
  },
  {
    id: 'g2',
    author: users[1],
    content: 'My latest project is finally live! So proud of what our team has accomplished. Building with Next.js is always a joy. #webdev #coding #react',
    createdAt: '2023-10-26T09:00:00Z',
    likes: 89,
    comments: comments.g2,
  },
  {
    id: 'g3',
    author: users[2],
    content: 'There’s nothing quite like the peace you find at the top of a mountain. 10 miles in, 10 to go! #hiking #adventure #mountains',
    mediaUrl: 'https://picsum.photos/seed/glance2/600/800',
    mediaType: 'image',
    createdAt: '2023-10-25T14:00:00Z',
    likes: 230,
    comments: comments.g3,
  },
  {
    id: 'g4',
    author: users[1],
    content: 'Perfected my sourdough recipe this weekend. The crust, the crumb... *chef\'s kiss*. Who wants a slice?',
    mediaUrl: 'https://picsum.photos/seed/glance3/800/600',
    mediaType: 'image',
    createdAt: '2023-10-24T19:00:00Z',
    likes: 178,
    comments: comments.g4,
  },
  {
    id: 'g5',
    author: users[3],
    content: 'Visited the new exhibit on ancient civilizations today. The artifacts were incredibly well-preserved. A journey back in time!',
    mediaUrl: 'https://picsum.photos/seed/glance4/600/600',
    mediaType: 'image',
    createdAt: '2023-10-23T11:00:00Z',
    likes: 121,
    comments: comments.g5,
  },
];
