import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SequencePuzzle } from '@/lib/puzzleEngine';

interface SequenceBoardProps {
  puzzle: SequencePuzzle;
  onSubmit: (answer: number) => void;
  completed: boolean;
  correct: boolean | null;
}

const SequenceBoard: React.FC<SequenceBoardProps> = ({ puzzle, onSubmit, completed, correct }) => {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(() => {
    const num = parseInt(input, 10);
    if (!isNaN(num)) {
      onSubmit(num);
    }
  }, [input, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="font-display text-lg text-muted-foreground mb-2">Find the missing number</h3>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {puzzle.numbers.map((num, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
          >
            {num !== null ? (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-secondary border border-border flex items-center justify-center font-display text-xl sm:text-2xl text-foreground">
                {num}
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 border-dashed border-primary/50 flex items-center justify-center animate-glow">
                {completed ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`font-display text-xl sm:text-2xl ${correct ? 'text-primary' : 'text-destructive'}`}
                  >
                    {puzzle.answer}
                  </motion.span>
                ) : (
                  <span className="text-primary/50 font-display text-2xl">?</span>
                )}
              </div>
            )}
            {i < puzzle.numbers.length - 1 && (
              <div className="hidden sm:block" />
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {!completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-3"
          >
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your answer"
              className="w-40 h-12 rounded-lg bg-secondary border border-border px-4 font-display text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!input}
              className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-display font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SequenceBoard;
