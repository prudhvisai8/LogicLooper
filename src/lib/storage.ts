import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(dayOfYear);

export interface DailyActivity {
  date: string;
  solved: boolean;
  score: number;
  timeTaken: number;
  difficulty: number;
  hintsUsed: number;
}

export interface GameState {
  currentAnswer: number | null;
  timerStarted: boolean;
  startTime: number | null;
  hintsUsed: number;
  hintsRevealed: string[];
  completed: boolean;
}

const STORAGE_KEY = 'logic-looper-activity';
const STATE_KEY = 'logic-looper-state';
const MAX_HINTS_PER_DAY = 3;

export function loadActivity(): Record<string, DailyActivity> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveActivity(activity: Record<string, DailyActivity>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activity));
}

export function getTodayActivity(): DailyActivity | null {
  const activity = loadActivity();
  return activity[dayjs().format('YYYY-MM-DD')] || null;
}

export function saveDailyResult(result: Omit<DailyActivity, 'date'>): void {
  const activity = loadActivity();
  const today = dayjs().format('YYYY-MM-DD');
  activity[today] = { ...result, date: today };
  saveActivity(activity);
}

export function loadGameState(): GameState | null {
  try {
    const data = localStorage.getItem(`${STATE_KEY}-${dayjs().format('YYYY-MM-DD')}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(`${STATE_KEY}-${dayjs().format('YYYY-MM-DD')}`, JSON.stringify(state));
}

export function calculateStreak(activity: Record<string, DailyActivity>): number {
  let streak = 0;
  let current = dayjs();

  // If today isn't solved yet, start checking from yesterday
  if (!activity[current.format('YYYY-MM-DD')]?.solved) {
    current = current.subtract(1, 'day');
  }

  while (activity[current.format('YYYY-MM-DD')]?.solved) {
    streak++;
    current = current.subtract(1, 'day');
  }

  return streak;
}

export function getRemainingHints(hintsUsed: number): number {
  return Math.max(0, MAX_HINTS_PER_DAY - hintsUsed);
}

export { MAX_HINTS_PER_DAY };
