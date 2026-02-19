import React from 'react';
import { motion } from 'framer-motion';

interface StreakDisplayProps {
  streak: number;
  justCompleted?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, justCompleted }) => {
  return (
    <div className="flex items-center gap-2">
      <motion.span
        className="text-2xl"
        animate={justCompleted ? { 
          scale: [1, 1.5, 1],
          rotate: [0, -10, 10, 0],
        } : {}}
        transition={{ duration: 0.5 }}
      >
        🔥
      </motion.span>
      <div className="flex flex-col">
        <motion.span
          className="font-display text-2xl font-bold text-streak streak-glow leading-none"
          key={streak}
          initial={justCompleted ? { scale: 2, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
        >
          {streak}
        </motion.span>
        <span className="text-xs text-muted-foreground font-body">
          day streak
        </span>
      </div>
    </div>
  );
};

export default StreakDisplay;
