import { z } from "zod";

export const VocabWordSchema = z.object({
  word: z.string().describe("The English vocabulary word or phrase"),
  ipa: z.string().describe("IPA pronunciation, e.g. /haɪˈdreɪʃən/"),
  partOfSpeech: z.string().describe("Part of speech: noun, verb, adjective, etc."),
  translation: z.string().describe("Concise Chinese translation"),
  definition: z.string().describe("Clear English definition in one sentence"),
  example: z.string().describe("A new example sentence using the word (not from the article)"),
  contextSentence: z.string().describe("The original sentence from the article where the word appears"),
  difficulty: z.enum(["basic", "intermediate", "advanced"]).describe("Difficulty level"),
});

export const VocabListSchema = z.object({
  words: z.array(VocabWordSchema).describe("12-24 vocabulary words extracted from the article"),
});

export type VocabWord = z.infer<typeof VocabWordSchema>;
export type VocabList = z.infer<typeof VocabListSchema>;
