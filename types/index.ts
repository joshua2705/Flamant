export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  location?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sellerId: string;
  seller: User;
  location: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  servings?: number;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  updatedAt: Date;
  productId?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
  transactionId?: string;
  createdAt: Date;
}