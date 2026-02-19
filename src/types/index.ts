// src/types/index.ts

export interface Profile {
  id: string;
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyScore {
  id: string;
  user_id: string;
  date: string;
  difficulty: number;
  score: number;
  time_taken: number;
  hints_used: number;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  puzzles_solved: number;
  streak_count: number;
  total_points: number;
  last_played?: string | null;
  created_at: string;
  updated_at: string;
}
