export function buildSummaryPrompt(
  content: string,
  userLevel: string,
): string {
  return `You are an expert content analyst helping Chinese students understand technical articles.

Analyze the following article and produce a structured summary in Chinese (Simplified).

Requirements:
- title: A concise Chinese title that captures the core topic (not a direct translation of the original title)
- summary: A 3-5 sentence summary in Chinese that explains the main points. Tailor the language complexity to a ${userLevel} level reader.
- bulletPoints: 3-6 key takeaways as bullet points in Chinese. Each point should be actionable or insightful.

Guidelines:
- Use clear, accessible Chinese — avoid overly academic language
- Preserve important technical terms in English within parentheses when first mentioned, e.g. "服务端组件 (Server Components)"
- Focus on the "why" and "so what", not just the "what"
- If the article contains code examples, summarize what they demonstrate rather than listing code

Article content:
---
${content.slice(0, 15000)}
---`;
}
