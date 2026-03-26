import type {
  DigestAgent,
  AgentRuntime,
  ContentInput,
  DigestEvent,
} from "@dinodigest/module-sdk";
import { VocabListSchema } from "./schema.js";
import { buildVocabPrompt } from "./prompts.js";

interface VocabConfig {
  maxCards: number;
  difficulty: string;
  includeIPA: boolean;
}

export class VocabFlashcardAgent implements DigestAgent {
  private config: VocabConfig;

  constructor(private runtime: AgentRuntime) {
    this.config = {
      maxCards: 12,
      difficulty: "intermediate",
      includeIPA: true,
      ...(runtime.userConfig.moduleConfig as Partial<VocabConfig>),
    };
  }

  async *digest(input: ContentInput): AsyncGenerator<DigestEvent> {
    // Only process English content
    if (input.language !== "en") {
      yield {
        type: "error",
        error: "Vocab flashcard module only supports English content",
        recoverable: false,
      };
      return;
    }

    this.runtime.log.info(
      `Processing: ${input.title} (${input.wordCount} words)`,
    );

    // Step 1: Extract vocabulary
    yield { type: "status", message: "Extracting vocabulary..." };
    yield { type: "progress", percent: 10 };

    const prompt = buildVocabPrompt(input.content, this.config);

    let vocabResult;
    try {
      vocabResult = await this.runtime.llm.generateStructured(
        prompt,
        VocabListSchema,
      );
    } catch (err) {
      yield {
        type: "error",
        error: `Vocabulary extraction failed: ${err}`,
        recoverable: false,
      };
      return;
    }

    yield { type: "progress", percent: 60 };
    yield {
      type: "status",
      message: `Found ${vocabResult.words.length} vocabulary words`,
    };

    // Step 2: Generate flashcards
    const total = vocabResult.words.length;
    for (let i = 0; i < total; i++) {
      const word = vocabResult.words[i];

      const front = this.config.includeIPA
        ? `${word.word}  [${word.ipa}]`
        : word.word;

      const backLines = [
        `**${word.translation}** (${word.partOfSpeech})`,
        "",
        word.definition,
        "",
        `Example: _${word.example}_`,
        "",
        `Context: "${word.contextSentence}"`,
      ];

      yield {
        type: "result",
        output: {
          kind: "flashcard",
          data: {
            front,
            back: backLines.join("\n"),
            tags: ["vocab", word.difficulty, input.id],
          },
        },
      };

      yield { type: "progress", percent: 60 + ((i + 1) / total) * 40 };
    }

    this.runtime.log.info(`Generated ${total} flashcards`);
  }
}
