export function buildKeyPointsPrompt(
  content: string,
  userLevel: string,
): string {
  return `You are a knowledge extraction expert helping Chinese students break down technical articles into digestible concepts.

Analyze the following article and extract 3-8 key concepts/knowledge points.

For each concept, provide:
- concept: The concept name in Chinese. If it's a technical term, include the English in parentheses, e.g. "虚拟DOM (Virtual DOM)"
- explanation: A clear explanation in Chinese that a ${userLevel}-level student can understand. Use simple language, avoid jargon. 2-4 sentences.
- analogy: (optional) A real-world analogy to make the concept click. Only include if it genuinely helps understanding.
- difficulty: A number from 1-5 indicating how advanced the concept is (1=basic, 3=intermediate, 5=expert)

Guidelines:
- Extract the MOST IMPORTANT concepts, not every minor detail
- Order by importance (most important first)
- Each explanation should be self-contained — understandable without reading the article
- Use everyday Chinese, not textbook Chinese
- For ${userLevel} level: ${
    userLevel === "beginner"
      ? "explain everything from scratch, assume no prior knowledge"
      : userLevel === "intermediate"
        ? "assume basic programming knowledge, explain domain-specific concepts"
        : "be concise, focus on nuances and advanced implications"
  }

Article content:
---
${content.slice(0, 15000)}
---`;
}
