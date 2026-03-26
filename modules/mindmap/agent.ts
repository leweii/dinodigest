import type {
  DigestAgent,
  AgentRuntime,
  ContentInput,
  DigestEvent,
  MindMapNode,
} from "@dinodigest/module-sdk";
import { MindMapResultSchema } from "./schema.js";
import { buildMindMapPrompt } from "./prompts.js";

export class MindMapAgent implements DigestAgent {
  constructor(private runtime: AgentRuntime) {}

  async *digest(input: ContentInput): AsyncGenerator<DigestEvent> {
    yield { type: "status", message: "正在构建思维导图..." };
    yield { type: "progress", percent: 10 };

    const prompt = buildMindMapPrompt(
      input.content,
      this.runtime.userConfig.level,
    );

    let result;
    try {
      result = await this.runtime.llm.generateStructured(
        prompt,
        MindMapResultSchema,
      );
    } catch (err) {
      yield {
        type: "error",
        error: `思维导图生成失败：${err}`,
        recoverable: false,
      };
      return;
    }

    yield { type: "progress", percent: 90 };

    // Count total nodes
    function countNodes(node: { children?: unknown[] }): number {
      let count = 1;
      if (node.children) {
        for (const child of node.children) {
          count += countNodes(child as { children?: unknown[] });
        }
      }
      return count;
    }

    const totalNodes = countNodes(result);

    yield {
      type: "status",
      message: `已生成包含 ${totalNodes} 个节点的思维导图`,
    };

    yield {
      type: "result",
      output: {
        kind: "mind_map",
        data: result as MindMapNode,
      },
    };

    yield { type: "progress", percent: 100 };
  }
}
