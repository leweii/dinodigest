export function buildMindMapPrompt(
  content: string,
  userLevel: string,
): string {
  return `You are a knowledge structuring expert. Analyze the following article and create a hierarchical mind map structure in Chinese.

Requirements:
- Root node: The article's core topic (concise, in Chinese)
- Level 1: 3-6 main concepts/themes from the article
- Level 2: 2-4 sub-points under each main concept
- Level 3 (optional): 1-3 details under important sub-points, only if needed

Guidelines:
- All node names in Chinese, with English technical terms in parentheses when relevant
  e.g. "服务端组件 (Server Components)"
- Keep node names SHORT (2-8 Chinese characters + optional English term)
- Structure should show relationships and hierarchy, not just list points
- For ${userLevel} level:
  ${userLevel === "beginner" ? "- Focus on the big picture, fewer details" : ""}
  ${userLevel === "intermediate" ? "- Balance between overview and technical detail" : ""}
  ${userLevel === "advanced" ? "- Include nuanced technical distinctions" : ""}
- The tree should have 15-30 total nodes (not too sparse, not too dense)

Return a JSON object with this structure:
{
  "name": "核心主题",
  "children": [
    {
      "name": "概念A",
      "children": [
        { "name": "要点1" },
        { "name": "要点2" }
      ]
    }
  ]
}

Article content:
---
${content.slice(0, 12000)}
---`;
}
