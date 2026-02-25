import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  avatar: string;
  is_admin: boolean;
  room_id: string;
  joined_at: Timestamp;
  last_seen: Timestamp;
}

export interface Room {
  id: string;
  created_at: Timestamp;
  last_activity: Timestamp;
  result: ResultData | null;
  title?: string;
  teams?: TeamData[] | null;
  teamsCreatedCount?: number;
  spinWheel?: boolean;
  spinWheelData?: SpinWheelData | null;
  winnerSelectedCount?: number;
  loserSelectedCount?: number;
  spinWheelSelectedCount?: number;
}

export interface Option {
  id: string;
  room_id: string;
  text: string;
  created_at: Timestamp;
}

export interface ResultData {
  type: 'winner' | 'loser';
  option_id: string;
}

export interface TeamData {
  teamNumber: number;
  members: string[];
}

export interface SpinWheelData {
  targetRotation: number;
  winnerOptionId: string;
  timestamp: number;
}

export interface LocalStorageUser {
  id: string;
  name: string;
  avatar: string;
  room_id: string;
}
