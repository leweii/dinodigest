import type { DigestModule } from "@dinodigest/module-sdk";
import { z } from "zod";
import { VocabFlashcardAgent } from "./agent.js";

const vocabFlashcardModule: DigestModule = {
  manifest: {
    id: "vocab-flashcard",
    name: "Vocabulary Flashcards",
    description:
      "Extracts difficult vocabulary from English content and generates flashcards with Chinese translations, IPA pronunciation, and contextual examples.",
    version: "1.0.0",
    author: "DinoDigest Team",
    accepts: {
      contentTypes: ["article", "documentation", "paper"],
      languages: ["en"],
      minContentLength: 200,
    },
    outputs: ["flashcard"],
    configSchema: z.object({
      maxCards: z.number().min(12).max(30).default(24),
      difficulty: z
        .enum(["beginner", "intermediate", "advanced"])
        .default("intermediate"),
      includeIPA: z.boolean().default(true),
    }),
  },

  createAgent(runtime) {
    return new VocabFlashcardAgent(runtime);
  },
};

export default vocabFlashcardModule;
