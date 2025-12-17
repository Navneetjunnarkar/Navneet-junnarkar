export enum UserRole {
  USER = 'USER',
  LAWYER = 'LAWYER',
  ADMIN = 'ADMIN'
}

export type Language = 'en' | 'hi' | 'mr' | 'pa' | 'raj';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  avatarUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface LegalDocument {
  id: string;
  name: string;
  uploadDate: Date;
  summary?: string;
  status: 'Processing' | 'Analyzed' | 'Pending Review';
  type: string;
}

export interface LawyerProfile {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  location: string;
  rating: number;
}