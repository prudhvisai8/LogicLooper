import dayjs from 'dayjs';

// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return (this.seed >>> 0) / 0xffffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export type PuzzleType = 'sequence' | 'pattern-grid';

export interface SequencePuzzle {
  type: 'sequence';
  numbers: (number | null)[];
  missingIndex: number;
  answer: number;
  rule: string;
  difficulty: number;
}

export interface PatternGridPuzzle {
  type: 'pattern-grid';
  grid: (number | null)[];
  missingIndex: number;
  answer: number;
  options: number[];
  rule: string;
  difficulty: number;
}

export type Puzzle = SequencePuzzle | PatternGridPuzzle;

function generateSequencePuzzle(rng: SeededRandom, difficulty: number): SequencePuzzle {
  const patterns = [
    // Arithmetic sequences
    () => {
      const start = rng.nextInt(1, 20);
      const diff = rng.nextInt(2, 8 + difficulty * 2);
      const nums = Array.from({ length: 6 }, (_, i) => start + diff * i);
      return { nums, rule: `+${diff}` };
    },
    // Geometric-ish
    () => {
      const start = rng.nextInt(1, 5);
      const mult = rng.nextInt(2, 3);
      const nums = Array.from({ length: 6 }, (_, i) => start * Math.pow(mult, i));
      return { nums, rule: `×${mult}` };
    },
    // Squares
    () => {
      const offset = rng.nextInt(0, 5);
      const nums = Array.from({ length: 6 }, (_, i) => (i + 1 + offset) * (i + 1 + offset));
      return { nums, rule: `(n+${offset})²` };
    },
    // Fibonacci-like
    () => {
      const a = rng.nextInt(1, 5);
      const b = rng.nextInt(1, 5);
      const nums = [a, b];
      for (let i = 2; i < 6; i++) nums.push(nums[i - 1] + nums[i - 2]);
      return { nums, rule: 'Fibonacci-like' };
    },
    // Alternating add
    () => {
      const start = rng.nextInt(1, 10);
      const d1 = rng.nextInt(2, 6);
      const d2 = rng.nextInt(1, 4);
      const nums = [start];
      for (let i = 1; i < 6; i++) nums.push(nums[i - 1] + (i % 2 === 1 ? d1 : d2));
      return { nums, rule: `alternating +${d1}/+${d2}` };
    },
  ];

  const patternIndex = rng.nextInt(0, Math.min(patterns.length - 1, 1 + difficulty));
  const { nums, rule } = patterns[patternIndex]();
  const missingIndex = rng.nextInt(1, nums.length - 1);
  const answer = nums[missingIndex];
  const display = nums.map((n, i) => i === missingIndex ? null : n);

  return {
    type: 'sequence',
    numbers: display,
    missingIndex,
    answer,
    rule,
    difficulty,
  };
}

function generatePatternGridPuzzle(rng: SeededRandom, difficulty: number): PatternGridPuzzle {
  // 3x3 grid with a pattern
  const patterns = [
    // Each row sums to same value
    () => {
      const targetSum = rng.nextInt(10, 20 + difficulty * 5);
      const grid: number[] = [];
      for (let row = 0; row < 3; row++) {
        const a = rng.nextInt(1, targetSum - 2);
        const b = rng.nextInt(1, targetSum - a - 1);
        const c = targetSum - a - b;
        grid.push(a, b, c);
      }
      return { grid, rule: `Each row sums to ${targetSum}` };
    },
    // Incrementing pattern
    () => {
      const start = rng.nextInt(1, 5);
      const diff = rng.nextInt(1, 3);
      const grid = Array.from({ length: 9 }, (_, i) => start + diff * i);
      return { grid, rule: `Increment by ${diff}` };
    },
    // Each column multiplies
    () => {
      const bases = [rng.nextInt(1, 4), rng.nextInt(1, 4), rng.nextInt(1, 4)];
      const mult = rng.nextInt(2, 3);
      const grid: number[] = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          grid.push(bases[col] * Math.pow(mult, row));
        }
      }
      return { grid, rule: `Columns multiply by ${mult}` };
    },
  ];

  const patternIndex = rng.nextInt(0, Math.min(patterns.length - 1, difficulty));
  const { grid, rule } = patterns[patternIndex]();
  const missingIndex = rng.nextInt(0, 8);
  const answer = grid[missingIndex];

  // Generate wrong options
  const options = rng.shuffle([
    answer,
    answer + rng.nextInt(1, 5),
    answer - rng.nextInt(1, Math.max(1, answer - 1)),
    answer + rng.nextInt(2, 8),
  ].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i));

  // Ensure answer is in options and we have 4
  const finalOptions = [answer];
  for (const o of options) {
    if (o !== answer && finalOptions.length < 4) finalOptions.push(o);
  }
  while (finalOptions.length < 4) {
    finalOptions.push(answer + finalOptions.length * 2);
  }

  const display = grid.map((n, i) => i === missingIndex ? null : n);

  return {
    type: 'pattern-grid',
    grid: display,
    missingIndex,
    answer,
    options: rng.shuffle(finalOptions),
    rule,
    difficulty,
  };
}

export function getDailyPuzzle(date?: string): Puzzle {
  const dateStr = date || dayjs().format('YYYY-MM-DD');
  const seed = hashString(`logic-looper-${dateStr}-v1`);
  const rng = new SeededRandom(seed);

  // Determine puzzle type based on day
  const dayOfYear = dayjs(dateStr).dayOfYear?.() ?? dayjs(dateStr).diff(dayjs(dateStr).startOf('year'), 'day');
  const puzzleType: PuzzleType = dayOfYear % 2 === 0 ? 'sequence' : 'pattern-grid';

  // Difficulty cycles: easy(1) -> medium(2) -> hard(3) over weeks
  const weekNum = Math.floor(dayOfYear / 7);
  const difficulty = Math.min(3, 1 + (weekNum % 3));

  if (puzzleType === 'sequence') {
    return generateSequencePuzzle(rng, difficulty);
  } else {
    return generatePatternGridPuzzle(rng, difficulty);
  }
}

export function validateAnswer(puzzle: Puzzle, answer: number): boolean {
  return answer === puzzle.answer;
}

export function calculateScore(timeTaken: number, hintsUsed: number, difficulty: number): number {
  const baseScore = 100 * difficulty;
  const timeBonus = Math.max(0, 300 - timeTaken); // Bonus for finishing under 5 min
  const hintPenalty = hintsUsed * 25;
  return Math.max(10, baseScore + timeBonus - hintPenalty);
}

export function getHint(puzzle: Puzzle): string {
  if (puzzle.type === 'sequence') {
    return `The pattern follows the rule: ${puzzle.rule}`;
  } else {
    return `Look for the pattern: ${puzzle.rule}`;
  }
}
