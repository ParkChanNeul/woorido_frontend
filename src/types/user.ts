export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  phone?: string;
  creditScore: number; // 신용 온도 (0-100)
  badges: Badge[];
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface UserProfile extends User {
  totalGyeCount: number;
  completedGyeCount: number;
  totalSavings: number;
}
