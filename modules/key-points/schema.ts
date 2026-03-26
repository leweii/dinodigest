import { z } from "zod";

export const KeyPointSchema = z.object({
  concept: z.string().describe("The concept name in Chinese, with English term in parentheses if technical"),
  explanation: z.string().describe("A clear, simple explanation in Chinese suitable for a student"),
  analogy: z.string().optional().describe("An optional analogy to make the concept more intuitive"),
  difficulty: z.number().min(1).max(5).describe("Difficulty level from 1 (basic) to 5 (expert)"),
});

export const KeyPointsResultSchema = z.object({
  keyPoints: z.array(KeyPointSchema).describe("3-8 key concepts from the article"),
});

export type KeyPoint = z.infer<typeof KeyPointSchema>;
export type KeyPointsResult = z.infer<typeof KeyPointsResultSchema>;
