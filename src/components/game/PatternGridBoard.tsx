import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PatternGridPuzzle } from '@/lib/puzzleEngine';

interface PatternGridBoardProps {
  puzzle: PatternGridPuzzle;
  onSubmit: (answer: number) => void;
  completed: boolean;
  correct: boolean | null;
}

const PatternGridBoard: React.FC<PatternGridBoardProps> = ({ puzzle, onSubmit, completed, correct }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="font-display text-lg text-muted-foreground mb-2">Complete the grid pattern</h3>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {puzzle.grid.map((num, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center font-display text-xl sm:text-2xl ${
                num !== null
                  ? 'bg-secondary border border-border text-foreground'
                  : completed
                  ? correct
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : 'bg-destructive/20 border-2 border-destructive text-destructive'
                  : 'border-2 border-dashed border-primary/50 animate-glow'
              }`}
            >
              {num !== null ? (
                num
              ) : completed ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  {puzzle.answer}
                </motion.span>
              ) : (
                <span className="text-primary/50">?</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {!completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            {puzzle.options.map((option, i) => (
              <motion.button
                key={option}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSubmit(option)}
                className="w-16 h-16 rounded-lg bg-secondary border border-border font-display text-xl text-foreground hover:border-primary hover:bg-primary/10 transition-colors"
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatternGridBoard;
