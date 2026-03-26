import type {
  DigestAgent,
  AgentRuntime,
  ContentInput,
  DigestEvent,
} from "@dinodigest/module-sdk";
import { z } from "zod";
import { KeyPointSchema, type KeyPointsResult, KeyPointsResultSchema } from "./schema.js";
import { buildKeyPointsPrompt } from "./prompts.js";

export class KeyPointsAgent implements DigestAgent {
  constructor(private runtime: AgentRuntime) {}

  async *digest(input: ContentInput): AsyncGenerator<DigestEvent> {
    yield { type: "status", message: "正在提取核心概念..." };
    yield { type: "progress", percent: 10 };

    const prompt = buildKeyPointsPrompt(
      input.content,
      this.runtime.userConfig.level,
    );

    let keyPoints: KeyPointsResult["keyPoints"];
    try {
      const raw = await this.runtime.llm.generateStructured(
        prompt,
        KeyPointsResultSchema,
      );
      keyPoints = raw.keyPoints;
    } catch {
      // Gemini sometimes returns a bare array instead of { keyPoints: [...] }
      try {
        const rawArray = await this.runtime.llm.generateStructured(
          prompt,
          z.array(KeyPointSchema),
        );
        keyPoints = rawArray;
      } catch (err) {
        yield {
          type: "error",
          error: `知识点提取失败：${err}`,
          recoverable: false,
        };
        return;
      }
    }

    yield { type: "progress", percent: 60 };
    yield {
      type: "status",
      message: `发现 ${keyPoints.length} 个核心概念`,
    };

    // Emit each key point as a separate result
    const total = keyPoints.length;
    for (let i = 0; i < total; i++) {
      const kp = keyPoints[i];

      yield {
        type: "result",
        output: {
          kind: "key_point",
          data: {
            concept: kp.concept,
            explanation: kp.explanation,
            analogy: kp.analogy,
            difficulty: kp.difficulty,
          },
        },
      };

      yield { type: "progress", percent: 60 + ((i + 1) / total) * 40 };
    }
  }
}
