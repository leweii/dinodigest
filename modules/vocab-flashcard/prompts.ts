export function buildVocabPrompt(
  content: string,
  config: { maxCards: number; difficulty: string; includeIPA: boolean },
): string {
  return `You are a vocabulary extraction expert helping Chinese students learn English through technical articles.

Analyze the following article and extract ${config.maxCards} vocabulary words that would be challenging for a ${config.difficulty}-level Chinese English learner.

For each word, provide:
- word: the vocabulary word or phrase
- ipa: IPA pronunciation (e.g. /ˈhɪd.rə.ʃən/)
- partOfSpeech: noun, verb, adjective, adverb, etc.
- translation: concise Chinese translation (1-3 words)
- definition: clear English definition (1 sentence, simple language)
- example: a NEW example sentence using the word (do NOT copy from the article)
- contextSentence: the EXACT sentence from the article where the word appears (copy verbatim)
- difficulty: basic, intermediate, or advanced

Selection criteria:
- Skip very common words (the, is, have, make, use, etc.)
- Prioritize domain-specific terms and academic vocabulary
- Include words that appear in important/key sentences
- Choose words the reader NEEDS to know to understand the article
- For ${config.difficulty} level:
  ${config.difficulty === "beginner" ? "- Focus on common but non-trivial words that appear frequently in tech articles" : ""}
  ${config.difficulty === "intermediate" ? "- Include technical terms, academic vocabulary, and useful collocations" : ""}
  ${config.difficulty === "advanced" ? "- Focus on nuanced, rare, or highly technical terms and idiomatic expressions" : ""}

Important:
- Only extract words that ACTUALLY APPEAR in the article
- The contextSentence must be a real sentence from the article, copied exactly
- Provide accurate IPA pronunciation
- Chinese translations should be natural and commonly used

Article content:
---
${content.slice(0, 12000)}
---`;
}
