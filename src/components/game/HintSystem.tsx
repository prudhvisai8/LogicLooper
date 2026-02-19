import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRemainingHints, MAX_HINTS_PER_DAY } from '@/lib/storage';

interface HintSystemProps {
  hintsUsed: number;
  hintsRevealed: string[];
  onRequestHint: () => void;
  disabled: boolean;
}

const HintSystem: React.FC<HintSystemProps> = ({ hintsUsed, hintsRevealed, onRequestHint, disabled }) => {
  const remaining = getRemainingHints(hintsUsed);

  return (
    <div className="space-y-3">
      <button
        onClick={onRequestHint}
        disabled={disabled || remaining <= 0}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border font-display text-sm text-hint hover:bg-hint/10 hover:border-hint/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span>💡</span>
        <span>Hint ({remaining}/{MAX_HINTS_PER_DAY})</span>
      </button>

      <AnimatePresence>
        {hintsRevealed.map((hint, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            className="px-4 py-2 rounded-lg bg-hint/10 border border-hint/20 text-hint/80 text-sm font-body"
          >
            {hint}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default HintSystem;
