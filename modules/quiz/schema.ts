import { z } from "zod";

export const QuizQuestionSchema = z.object({
  question: z.string().describe("A comprehension question about the article, in Chinese"),
  options: z.array(z.string()).describe("4 answer choices in Chinese"),
  correctIndex: z.number().min(0).max(3).describe("Index of the correct answer (0-based)"),
  explanation: z.string().describe("Why the correct answer is correct, in Chinese"),
});

export const QuizResultSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe("3-5 comprehension questions"),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizResult = z.infer<typeof QuizResultSchema>;
