import type { User, Message } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Kaelen Shadowhand',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar1')?.imageUrl ?? 'https://picsum.photos/seed/1/100/100',
    bio: 'Whisperer of forgotten tongues, walker of the twilight paths. My blade is as sharp as my wit.',
  },
  {
    id: '2',
    name: 'Seraphina a.k.a Hexa',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar2')?.imageUrl ?? 'https://picsum.photos/seed/2/100/100',
    bio: 'Weaver of curses and cartographer of the abyss. My spells speak truths you are not ready to hear.',
  },
  {
    id: '3',
    name: 'Gideon the Unbroken',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar3')?.imageUrl ?? 'https://picsum.photos/seed/3/100/100',
    bio: 'My shield is the last thing many have seen. I stand where others fall.',
  },
  {
    id: '4',
    name: 'Lyra Nightwind',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar4')?.imageUrl ?? 'https://picsum.photos/seed/4/100/100',
    bio: 'The night is my ally, the shadows my kin. You will not see me coming.',
  },
  {
    id: '5',
    name: 'Morthos, Eater of Hope',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar5')?.imageUrl ?? 'https://picsum.photos/seed/5/100/100',
    bio: '...',
  },
];

export const currentUser: User = mockUsers[0];

export const mockMessages: Message[] = [
  {
    id: '1',
    author: mockUsers[1],
    content: 'The old ruins south of the Crying Peaks are stirring again. I felt it on the winds.',
    timestamp: '10:30 PM',
  },
  {
    id: '2',
    author: mockUsers[2],
    content: 'Stirring how? Another band of grave robbers or something more sinister?',
    timestamp: '10:31 PM',
  },
  {
    id: '3',
    author: mockUsers[3],
    content: 'I scouted the area at dusk. The runic wards are failing. The air is thick with malefic energy.',
    timestamp: '10:33 PM',
  },
  {
    id: '4',
    author: mockUsers[1],
    content: 'Worse. The echoes... they scream of the Abyssal Lord once imprisoned there.',
    timestamp: '10:34 PM',
  },
  {
    id: '5',
    author: currentUser,
    content: 'Then we have work to do. I will rally the willing at the Onyx Keep. Be ready.',
    timestamp: '10:36 PM',
  },
    {
    id: '6',
    author: mockUsers[4],
    content: 'I will watch from the shadows.',
    timestamp: '10:38 PM',
  },
];
