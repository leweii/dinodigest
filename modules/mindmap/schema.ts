import { z } from "zod";

export const MindMapNodeSchema: z.ZodType<{
  name: string;
  children?: { name: string; children?: unknown[] }[];
}> = z.lazy(() =>
  z.object({
    name: z.string().describe("Node label — concise concept name in Chinese (with English term in parentheses if technical)"),
    children: z.array(MindMapNodeSchema).optional().describe("Child nodes, 2-4 per parent"),
  }),
);

export const MindMapResultSchema = z.object({
  name: z.string().describe("Root node — the article's core topic in Chinese"),
  children: z.array(MindMapNodeSchema).describe("3-6 main branches"),
});

export type MindMapNodeType = z.infer<typeof MindMapNodeSchema>;
