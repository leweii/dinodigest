/**
 * SM-2 Spaced Repetition Algorithm
 * https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */

export interface SM2Input {
  repetitions: number;
  easeFactor: number;
  interval: number; // days
}

export interface SM2Result {
  repetitions: number;
  easeFactor: number;
  interval: number; // days
  nextReviewAt: Date;
}

/**
 * Calculate next review based on SM-2 algorithm.
 * @param quality - Rating 0-5 (0=Again, 3=Hard, 4=Good, 5=Easy)
 * @param prev - Previous SM-2 state
 */
export function sm2(quality: number, prev: SM2Input): SM2Result {
  let { repetitions, easeFactor, interval } = prev;

  if (quality < 3) {
    // Failed — reset
    repetitions = 0;
    interval = 0;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor (minimum 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { repetitions, easeFactor, interval, nextReviewAt };
}
