import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { getDailyPuzzle, validateAnswer, calculateScore, getHint } from '@/lib/puzzleEngine';
import {
  loadActivity,
  saveDailyResult,
  loadGameState,
  saveGameState,
  calculateStreak,
  getRemainingHints,
  type GameState,
} from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { syncToCloud, pullFromCloud } from '@/lib/cloudSync';
import SequenceBoard from '@/components/game/SequenceBoard';
import PatternGridBoard from '@/components/game/PatternGridBoard';
import Timer from '@/components/game/Timer';
import HintSystem from '@/components/game/HintSystem';
import StreakDisplay from '@/components/game/StreakDisplay';
import Heatmap from '@/components/game/Heatmap';
import CompletionOverlay from '@/components/game/CompletionOverlay';
import { LogOut } from 'lucide-react';

dayjs.extend(dayOfYear);

const Index: React.FC = () => {
  const { user, isGuest, logout, authLoading } = useAuth();
  const puzzle = useMemo(() => getDailyPuzzle(), []);
  const [activity, setActivity] = useState(() => loadActivity());
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGameState();
    const todayActivity = activity[dayjs().format('YYYY-MM-DD')];
    if (todayActivity?.solved) {
      return {
        currentAnswer: todayActivity.score,
        timerStarted: false,
        startTime: null,
        hintsUsed: 0,
        hintsRevealed: [],
        completed: true,
      };
    }
    return saved || {
      currentAnswer: null,
      timerStarted: false,
      startTime: null,
      hintsUsed: 0,
      hintsRevealed: [],
      completed: false,
    };
  });
  const [correct, setCorrect] = useState<boolean | null>(() => {
    const todayActivity = activity[dayjs().format('YYYY-MM-DD')];
    return todayActivity?.solved ? true : null;
  });
  const [showOverlay, setShowOverlay] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const streak = useMemo(() => calculateStreak(activity), [activity]);
  const todayStr = dayjs().format('YYYY-MM-DD');
  const todaySolved = activity[todayStr]?.solved || false;

  // Sync with cloud on mount
  useEffect(() => {
    if (user) {
      pullFromCloud(user.id).then(() => {
        setActivity(loadActivity());
      });
    }
  }, [user]);

  // Auto-start timer on first interaction
  const ensureTimerStarted = useCallback(() => {
    if (!gameState.timerStarted && !gameState.completed) {
      const newState = { ...gameState, timerStarted: true, startTime: Date.now() };
      setGameState(newState);
      saveGameState(newState);
    }
  }, [gameState]);

  const handleSubmit = useCallback((answer: number) => {
    ensureTimerStarted();
    const isCorrect = validateAnswer(puzzle, answer);
    setCorrect(isCorrect);

    if (isCorrect) {
      const now = Date.now();
      setEndTime(now);
      const timeTaken = gameState.startTime ? Math.floor((now - gameState.startTime) / 1000) : 0;
      const score = calculateScore(timeTaken, gameState.hintsUsed, puzzle.difficulty);

      const newState: GameState = { ...gameState, completed: true, currentAnswer: answer };
      setGameState(newState);
      saveGameState(newState);

      saveDailyResult({
        solved: true,
        score,
        timeTaken,
        difficulty: puzzle.difficulty,
        hintsUsed: gameState.hintsUsed,
      });

      const newActivity = loadActivity();
      setActivity(newActivity);
      setJustCompleted(true);

      // Sync to cloud if logged in
      if (user) {
        syncToCloud(user.id);
      }

      setTimeout(() => setShowOverlay(true), 500);
    } else {
      // Wrong answer - shake effect handled by animation
      setTimeout(() => setCorrect(null), 1000);
    }
  }, [puzzle, gameState, ensureTimerStarted]);

  const handleHint = useCallback(() => {
    ensureTimerStarted();
    if (getRemainingHints(gameState.hintsUsed) <= 0) return;
    const hint = getHint(puzzle);
    const newState = {
      ...gameState,
      hintsUsed: gameState.hintsUsed + 1,
      hintsRevealed: [...gameState.hintsRevealed, hint],
    };
    setGameState(newState);
    saveGameState(newState);
  }, [puzzle, gameState, ensureTimerStarted]);

  const difficultyLabel = ['', 'Easy', 'Medium', 'Hard'][puzzle.difficulty] || 'Easy';
  const puzzleTypeLabel = puzzle.type === 'sequence' ? 'Number Sequence' : 'Pattern Grid';

  return (
    <div className="min-h-screen bg-background grid-pattern scanline">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-4 sm:px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.h1
                className="font-display text-xl sm:text-2xl font-bold text-primary neon-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                ⟳ Logic Looper
              </motion.h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              <Timer
                running={gameState.timerStarted && !gameState.completed}
                startTime={gameState.startTime}
                endTime={endTime}
              />
              <StreakDisplay streak={streak} justCompleted={justCompleted} />
              <div className="flex items-center gap-2">
                {user ? (
                                <button
                onClick={async () => {
                  const result = await logout();
                  if (result?.error) {
                    console.error(result.error);
                  }
                }}
                disabled={authLoading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-all
                  ${
                    authLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}

                <span className="hidden sm:inline">
                  {authLoading ? "Signing out..." : "Sign Out"}
                </span>
              </button>
                ) : isGuest ? (
                  <a
                    href="/auth"
                    className="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-xs font-display text-primary hover:bg-primary/30 transition-colors"
                  >
                    Sign In
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-10">
          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
            {/* Puzzle Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2"
            >
              <p className="font-body text-sm text-muted-foreground">
                {dayjs().format('dddd, MMMM D, YYYY')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-display text-xs">
                  {puzzleTypeLabel}
                </span>
                <span className={`px-3 py-1 rounded-full font-display text-xs ${
                  puzzle.difficulty === 1 ? 'bg-heatmap-2/20 text-heatmap-2' :
                  puzzle.difficulty === 2 ? 'bg-hint/20 text-hint' :
                  'bg-destructive/20 text-destructive'
                }`}>
                  {difficultyLabel}
                </span>
              </div>
              {todaySolved && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-primary font-display text-sm neon-text"
                >
                  ✓ Completed today — come back tomorrow!
                </motion.p>
              )}
            </motion.div>

            {/* Puzzle Board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card/50 border border-border rounded-2xl p-6 sm:p-10 neon-border"
              onClick={ensureTimerStarted}
            >
              {puzzle.type === 'sequence' ? (
                <SequenceBoard
                  puzzle={puzzle}
                  onSubmit={handleSubmit}
                  completed={gameState.completed}
                  correct={correct}
                />
              ) : (
                <PatternGridBoard
                  puzzle={puzzle}
                  onSubmit={handleSubmit}
                  completed={gameState.completed}
                  correct={correct}
                />
              )}
            </motion.div>

            {/* Hints */}
            {!gameState.completed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
              >
                <HintSystem
                  hintsUsed={gameState.hintsUsed}
                  hintsRevealed={gameState.hintsRevealed}
                  onRequestHint={handleHint}
                  disabled={gameState.completed}
                />
              </motion.div>
            )}

            {/* Stats & Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h2 className="font-display text-lg text-foreground flex items-center gap-2">
                <span className="text-primary">■</span> Activity
              </h2>
              <div className="bg-card/30 border border-border rounded-2xl p-4 sm:p-6 overflow-hidden">
                <Heatmap activity={activity} />
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { label: 'Puzzles Solved', value: Object.values(activity).filter(a => a.solved).length, icon: '🧩' },
                { label: 'Best Streak', value: streak, icon: '🔥' },
                { label: 'Total Score', value: Object.values(activity).reduce((sum, a) => sum + (a.score || 0), 0), icon: '⭐' },
              ].map((stat, i) => (
                <div key={i} className="bg-card/50 border border-border rounded-xl p-4 text-center space-y-1">
                  <span className="text-2xl">{stat.icon}</span>
                  <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-4 py-4 text-center">
          <p className="font-body text-xs text-muted-foreground">
            Logic Looper — A daily puzzle for sharp minds
          </p>
        </footer>
      </div>

      {/* Completion Overlay */}
      {showOverlay && correct && (
        <CompletionOverlay
          score={activity[todayStr]?.score || 0}
          timeTaken={activity[todayStr]?.timeTaken || 0}
          streak={streak}
          correct={true}
          onDismiss={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
};

export default Index;
