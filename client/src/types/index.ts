export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'deite';
  content: string;
  timestamp: Date;
}

export interface DailyReflection {
  id: string;
  uid: string;
  date: string; // YYYY-MM-DD
  content: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
