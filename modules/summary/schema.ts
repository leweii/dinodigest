import { z } from "zod";

export const SummaryResultSchema = z.object({
  title: z.string().describe("A concise Chinese title for the article"),
  summary: z
    .string()
    .describe("A 3-5 sentence Chinese summary of the article's main points"),
  bulletPoints: z
    .array(z.string())
    .describe("6-12 key takeaways as bullet points in Chinese"),
});

export type SummaryResult = z.infer<typeof SummaryResultSchema>;
