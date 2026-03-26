import type {
  DigestAgent,
  AgentRuntime,
  ContentInput,
  DigestEvent,
} from "@dinodigest/module-sdk";
import { z } from "zod";
import { QuizQuestionSchema, QuizResultSchema, type QuizResult } from "./schema.js";
import { buildQuizPrompt } from "./prompts.js";

export class QuizAgent implements DigestAgent {
  constructor(private runtime: AgentRuntime) {}

  async *digest(input: ContentInput): AsyncGenerator<DigestEvent> {
    yield { type: "status", message: "Generating quiz questions..." };
    yield { type: "progress", percent: 10 };

    const prompt = buildQuizPrompt(
      input.content,
      this.runtime.userConfig.level,
    );

    let questions: QuizResult["questions"];
    try {
      const raw = await this.runtime.llm.generateStructured(
        prompt,
        QuizResultSchema,
      );
      questions = raw.questions;
    } catch {
      // Gemini sometimes returns a bare array instead of { questions: [...] }
      try {
        const rawArray = await this.runtime.llm.generateStructured(
          prompt,
          z.array(QuizQuestionSchema),
        );
        questions = rawArray;
      } catch (err) {
        yield {
          type: "error",
          error: `Quiz generation failed: ${err}`,
          recoverable: false,
        };
        return;
      }
    }

    yield { type: "progress", percent: 70 };
    yield {
      type: "status",
      message: `Generated ${questions.length} quiz questions`,
    };

    const total = questions.length;
    for (let i = 0; i < total; i++) {
      const q = questions[i];

      yield {
        type: "result",
        output: {
          kind: "quiz",
          data: {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          },
        },
      };

      yield { type: "progress", percent: 70 + ((i + 1) / total) * 30 };
    }

    this.runtime.log.info(`Generated ${total} quiz questions`);
  }
}
