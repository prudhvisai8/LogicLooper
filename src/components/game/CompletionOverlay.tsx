import React from 'react';
import { motion } from 'framer-motion';

interface CompletionOverlayProps {
  score: number;
  timeTaken: number;
  streak: number;
  correct: boolean;
  onDismiss: () => void;
}

const CompletionOverlay: React.FC<CompletionOverlayProps> = ({ score, timeTaken, streak, correct, onDismiss }) => {
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full mx-4 neon-box text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {correct ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-primary neon-text">
              Puzzle Solved!
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="font-display text-2xl font-bold text-foreground">{score}</p>
                <p className="text-xs text-muted-foreground font-body">Score</p>
              </div>
              <div className="space-y-1">
                <p className="font-display text-2xl font-bold text-timer">
                  {minutes}:{String(seconds).padStart(2, '0')}
                </p>
                <p className="text-xs text-muted-foreground font-body">Time</p>
              </div>
              <div className="space-y-1">
                <p className="font-display text-2xl font-bold text-streak streak-glow">{streak}🔥</p>
                <p className="text-xs text-muted-foreground font-body">Streak</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl"
            >
              😅
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-destructive">
              Not Quite!
            </h2>
            <p className="text-muted-foreground font-body">
              Try again — you've got this!
            </p>
          </>
        )}

        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold hover:bg-primary/90 transition-colors"
        >
          {correct ? 'Continue' : 'Try Again'}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default CompletionOverlay;
