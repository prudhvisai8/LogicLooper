import { loadActivity, saveActivity, type DailyActivity } from "@/lib/storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

export async function syncToCloud(userId: string): Promise<void> {
  const activity = loadActivity();
  const unsynced = Object.values(activity).filter(a => a.solved);

  if (unsynced.length === 0) return;

  const token = getToken();
  if (!token) return;

  await fetch(`${API_URL}/api/scores/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      scores: unsynced,
      stats: {
        streak_count: calculateStreakFromActivity(activity),
        total_points: unsynced.reduce((sum, a) => sum + a.score, 0),
        puzzles_solved: unsynced.length,
        last_played: unsynced
          .sort((a, b) => b.date.localeCompare(a.date))[0]?.date,
      },
    }),
  });
}

export async function pullFromCloud(userId: string): Promise<void> {
  const token = getToken();
  if (!token) return;

  const res = await fetch(`${API_URL}/api/scores`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return;

  const data = await res.json();
  if (!data?.scores?.length) return;

  const activity = loadActivity();

  for (const row of data.scores) {
    if (!activity[row.date]) {
      activity[row.date] = {
        date: row.date,
        solved: true,
        score: row.score,
        timeTaken: row.time_taken,
        difficulty: row.difficulty,
        hintsUsed: row.hints_used,
      };
    }
  }

  saveActivity(activity);
}

function calculateStreakFromActivity(
  activity: Record<string, DailyActivity>
): number {
  let streak = 0;
  const today = new Date();
  let current = new Date(today);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  if (!activity[fmt(current)]?.solved) {
    current.setDate(current.getDate() - 1);
  }

  while (activity[fmt(current)]?.solved) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}
