import type {
  DigestAgent,
  AgentRuntime,
  ContentInput,
  DigestEvent,
} from "@dinodigest/module-sdk";
import { z } from "zod";
import { VocabWordSchema, VocabListSchema, type VocabList } from "./schema.js";
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
      maxCards: 24,
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
        error: "词汇闪卡模块仅支持英文内容",
        recoverable: false,
      };
      return;
    }

    // Step 1: Extract vocabulary
    yield { type: "status", message: "正在提取词汇..." };
    yield { type: "progress", percent: 10 };

    const prompt = buildVocabPrompt(input.content, this.config);

    let words: VocabList["words"];
    try {
      const raw = await this.runtime.llm.generateStructured(
        prompt,
        VocabListSchema,
      );
      words = raw.words;
    } catch {
      // Gemini sometimes returns a bare array instead of { words: [...] }
      try {
        const rawArray = await this.runtime.llm.generateStructured(
          prompt,
          z.array(VocabWordSchema),
        );
        words = rawArray;
      } catch (err) {
        yield {
          type: "error",
          error: `词汇提取失败：${err}`,
          recoverable: false,
        };
        return;
      }
    }

    yield { type: "progress", percent: 60 };
    yield {
      type: "status",
      message: `发现 ${words.length} 个词汇`,
    };

    // Step 2: Generate flashcards
    const total = words.length;
    for (let i = 0; i < total; i++) {
      const word = words[i];

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
  }
}
