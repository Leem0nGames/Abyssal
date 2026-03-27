export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
}

export interface Message {
  id: string;
  author: User;
  content: string;
  timestamp: string;
}
