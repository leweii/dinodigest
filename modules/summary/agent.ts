import type {
  DigestAgent,
  AgentRuntime,
  ContentInput,
  DigestEvent,
} from "@dinodigest/module-sdk";
import { SummaryResultSchema } from "./schema.js";
import { buildSummaryPrompt } from "./prompts.js";

export class SummaryAgent implements DigestAgent {
  constructor(private runtime: AgentRuntime) {}

  async *digest(input: ContentInput): AsyncGenerator<DigestEvent> {
    // Step 1: Status update
    yield { type: "status", message: "正在生成摘要..." };
    yield { type: "progress", percent: 10 };

    // Step 2: Call LLM for structured summary
    const prompt = buildSummaryPrompt(
      input.content,
      this.runtime.userConfig.level,
    );

    let result;
    try {
      result = await this.runtime.llm.generateStructured(
        prompt,
        SummaryResultSchema,
      );
    } catch (err) {
      yield {
        type: "error",
        error: `摘要生成失败：${err}`,
        recoverable: false,
      };
      return;
    }

    yield { type: "progress", percent: 90 };

    // Step 3: Emit result
    yield {
      type: "result",
      output: {
        kind: "summary",
        data: {
          title: result.title,
          content: result.summary,
          bulletPoints: result.bulletPoints,
        },
      },
    };

    yield { type: "progress", percent: 100 };
  }
}
