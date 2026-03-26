export function buildQuizPrompt(
  content: string,
  userLevel: string,
): string {
  return `You are an educational assessment expert helping Chinese students verify their understanding of technical articles.

Generate 4 comprehension-check questions based on the following article. All questions and answers should be in Chinese (Simplified).

Requirements for each question:
- question: A clear question in Chinese that tests understanding (not just memorization)
- options: Exactly 4 answer choices in Chinese
- correctIndex: The index (0-3) of the correct answer
- explanation: A brief explanation in Chinese of why the correct answer is right

Question design guidelines:
- Mix different question types: conceptual understanding, application, comparison, cause-effect
- Questions should test UNDERSTANDING, not just recall of specific phrases
- Incorrect options should be plausible but clearly wrong
- Tailor difficulty to ${userLevel} level:
  ${userLevel === "beginner" ? "- Ask straightforward questions about main ideas and basic concepts" : ""}
  ${userLevel === "intermediate" ? "- Include questions about relationships between concepts and practical implications" : ""}
  ${userLevel === "advanced" ? "- Ask about edge cases, trade-offs, and deeper implications" : ""}
- Keep technical terms in English within parentheses when relevant

Article content:
---
${content.slice(0, 12000)}
---`;
}
