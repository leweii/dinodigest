import type {
  DigestAgent,
  AgentRuntime,
  ContentInput,
  DigestEvent,
} from "@dinodigest/module-sdk";
import { QuizResultSchema } from "./schema.js";
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

    let result;
    try {
      result = await this.runtime.llm.generateStructured(
        prompt,
        QuizResultSchema,
      );
    } catch (err) {
      yield {
        type: "error",
        error: `Quiz generation failed: ${err}`,
        recoverable: false,
      };
      return;
    }

    yield { type: "progress", percent: 70 };
    yield {
      type: "status",
      message: `Generated ${result.questions.length} quiz questions`,
    };

    // Emit each question as a separate result
    const total = result.questions.length;
    for (let i = 0; i < total; i++) {
      const q = result.questions[i];

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
