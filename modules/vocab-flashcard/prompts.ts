export function buildVocabPrompt(
  content: string,
  config: { maxCards: number; difficulty: string; includeIPA: boolean },
): string {
  const difficultyGuidance = {
    beginner: `Target: Chinese college students with CET-4 level English (~4,000-word vocabulary).
- Select words that appear frequently across tech articles but are NOT in the CET-4 word list
- Prefer concrete, high-frequency technical words over abstract academic ones
- Include useful verb-preposition collocations (e.g., "rely on", "account for")
- Avoid: words already well-known to most Chinese college students (e.g., "computer", "system", "method")`,
    intermediate: `Target: Chinese students with CET-6 level English (~6,000-word vocabulary).
- Select technical terms, academic vocabulary (AWL), and multi-word collocations
- Include words with context-dependent meanings where the article usage differs from the common meaning (e.g., "overhead" in computing vs. everyday English)
- Prioritize words that transfer across multiple technical domains
- Include phrasal verbs and idiomatic expressions used in technical writing (e.g., "boils down to", "trade off")`,
    advanced: `Target: Chinese students with IELTS 7+ or GRE-level English.
- Focus on precise technical jargon, nuanced academic vocabulary, and low-frequency but high-value words
- Include words where subtle distinctions matter (e.g., "latency" vs. "delay", "mutable" vs. "changeable")
- Prioritize idiomatic phrases, rhetorical devices, and domain-specific metaphors
- Select words that even advanced learners commonly confuse or misuse`,
  }[config.difficulty] || `Select words appropriate for a ${config.difficulty}-level learner, balancing technical terms, academic vocabulary, and useful collocations.`;

  return `You are an experienced TESOL instructor specializing in English for Specific Purposes (ESP) for Chinese learners. You have 15 years of experience teaching technical English to Chinese university students and creating spaced-repetition flashcard decks. You deeply understand common L1 interference patterns between Chinese and English and know which words Chinese learners systematically struggle with.

Your task: Extract exactly ${config.maxCards} high-value vocabulary items from the article below to create flashcards for a spaced-repetition system (SM-2).

## Step-by-Step Process

Follow these steps IN ORDER before producing output:

**Step 1: Identify the article's core arguments and key sentences.**
Read the article and mentally mark the 5-10 sentences that carry the most important ideas — thesis statements, key claims, definitions of concepts, and conclusions. These are where the most valuable vocabulary lives.

**Step 2: Build a candidate word list.**
From those key sentences (and secondarily from supporting sentences), identify candidate words and phrases that a Chinese ${config.difficulty}-level English learner would need to look up or might misunderstand. Cast a wide net here — aim for 2-3x more candidates than needed.

**Step 3: Apply the selection filter.**
Narrow down to exactly ${config.maxCards} words by applying these criteria (in priority order):
1. **Comprehension-unlocking**: Does knowing this word significantly improve understanding of the article? (HIGHEST priority)
2. **Transferability**: Will this word appear in other technical articles the student will read?
3. **Difficulty-appropriate**: Is this word at the right level for the target learner? (see Difficulty Guidance below)
4. **Variety**: Ensure a mix across: key technical terms (~40%), academic/general vocabulary (~35%), useful collocations or phrases (~25%)

**Step 4: Generate each flashcard field with quality checks.**
For each selected word, produce all fields while verifying accuracy (see Quality Gates below).

## Difficulty Guidance

${difficultyGuidance}

## Output Field Specifications

For each word, provide these fields:

- **word**: The vocabulary word or phrase exactly as it appears in the article. For collocations or phrasal verbs, include the full phrase (e.g., "trade off", "account for", "bottleneck").
${config.includeIPA ? `- **ipa**: IPA transcription in slashes. Use General American pronunciation. Double-check vowel quality and stress placement. For compound words, include primary AND secondary stress (e.g., /ˌmaɪ.kroʊ.ˈsɜːr.vɪs/). If unsure of exact IPA, use the most standard dictionary pronunciation.` : `- **ipa**: Leave as empty string "".`}
- **partOfSpeech**: The part of speech AS USED IN THE ARTICLE (a word used as a noun in context should be labeled "noun" even if it's commonly a verb).
- **translation**: The most natural Chinese translation FOR THIS SPECIFIC CONTEXT. Do NOT default to the first dictionary entry. Choose the translation a Chinese tech professional would actually use in conversation. 1-3 Chinese characters preferred, 4-6 acceptable if needed for precision.
- **definition**: A clear, simple English definition in ONE sentence. Use defining vocabulary (the 2,000 most common English words) whenever possible. Format: "[Part of speech context]: [definition]" is acceptable but not required.
- **example**: A NEW example sentence you create (NOT from the article). Requirements: (1) uses the word with the same meaning/sense as in the article, (2) is from a DIFFERENT but related technical domain to show transferability, (3) is natural — something you'd actually read in a blog post or textbook, (4) is 10-20 words long.
- **contextSentence**: The EXACT, VERBATIM sentence from the article where the word appears. Copy character-for-character including punctuation. Do NOT paraphrase, truncate, or modify. If the sentence is very long (>200 chars), you may still include it in full — do NOT shorten it.
- **difficulty**: One of "basic", "intermediate", or "advanced" — reflecting the word's inherent difficulty, NOT the learner's level. A basic word can still be selected for an advanced learner if it has a specialized meaning.

## Quality Gates (Critical)

Before finalizing each entry, verify:

1. **contextSentence accuracy**: The sentence MUST exist verbatim in the article text. If you cannot find the exact sentence, do NOT include this word. This is the #1 source of errors — be extremely careful.
2. **IPA accuracy**: ${config.includeIPA ? "Stress marks (ˈ for primary, ˌ for secondary) must be present and correctly placed. Vowel quality must match standard American English dictionary pronunciation. Common error: confusing /ɪ/ and /iː/, /æ/ and /ɛ/, or misplacing stress." : "Leave ipa as empty string."}
3. **Translation naturalness**: Ask yourself — would a Chinese developer actually say this translation when explaining the concept to a colleague? If the answer is no, choose a more natural one.
4. **Example sentence independence**: Your example sentence must NOT reuse phrasing from the article. It should work as a standalone sentence.

## Anti-patterns — DO NOT select these:

- Proper nouns, brand names, or acronyms (e.g., "JavaScript", "AWS", "HTTP")
- Words that any Chinese college student already knows (e.g., "important", "different", "technology", "information")
- Numbers, units, or formatting artifacts
- Words that only appear in metadata, headers, or boilerplate (author bios, footers)
- Single letters or symbols

## Good vs. Bad Examples

**GOOD flashcard entry:**
{
  "word": "bottleneck",
  "ipa": "/ˈbɑː.t̬əl.nek/",
  "partOfSpeech": "noun",
  "translation": "瓶颈",
  "definition": "A point in a system where progress slows down because one part cannot handle the amount of work.",
  "example": "The database query became the main bottleneck in our API response time.",
  "contextSentence": "Network latency is often the primary bottleneck in distributed microservice architectures.",
  "difficulty": "intermediate"
}
Why it's good: The word unlocks a key concept in the article. The translation "瓶颈" is exactly what a Chinese developer would say. The example sentence uses the same meaning but in a different scenario (database vs. network). IPA stress is correctly placed. The contextSentence is a complete, exact quote.

**BAD flashcard entry:**
{
  "word": "use",
  "ipa": "/juːz/",
  "partOfSpeech": "verb",
  "translation": "使用",
  "definition": "To employ something for a purpose.",
  "example": "We use Python for data analysis.",
  "contextSentence": "We use microservices to scale our application.",
  "difficulty": "basic"
}
Why it's bad: "use" is too common — every Chinese college student knows it. It doesn't unlock article comprehension. It wastes a flashcard slot.

**BAD flashcard entry:**
{
  "word": "ephemeral",
  "ipa": "/ɪˈfem.ɚ.əl/",
  "partOfSpeech": "adjective",
  "translation": "短暂的",
  "definition": "Lasting for a very short time.",
  "example": "The ephemeral nature of cloud instances means data can be lost.",
  "contextSentence": "These ephemeral containers are spun up on demand.",
  "difficulty": "advanced"
}
Why it's bad (if contextSentence is wrong): If the article actually says "These short-lived containers are spun up on demand" but you changed "short-lived" to "ephemeral", this is a hallucinated contextSentence. NEVER fabricate or modify the source sentence.

## Article Content

---
${content.slice(0, 12000)}
---

Extract ${config.maxCards} vocabulary items following all instructions above. Aim for comprehensive coverage of the article's important vocabulary — prioritize breadth across the article's key sections rather than clustering words from one paragraph. Return ONLY the JSON object matching the required schema.`;
}
