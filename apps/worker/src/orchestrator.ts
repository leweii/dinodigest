import { EventEmitter } from "node:events";
import { eq } from "drizzle-orm";
import type {
  AgentRuntime,
  ContentInput,
  DigestEvent,
  DigestModule,
  LLMClient,
  UserConfig,
} from "@dinodigest/module-sdk";
import { articles, digests, flashcards, type Database } from "@dinodigest/db";
import { ModuleRegistry } from "./module-registry.js";
import { fetchAndExtract } from "./fetcher.js";
import { detectLanguage } from "./language-detect.js";

/** Event emitted with module context attached */
export type OrchestrationEvent = DigestEvent & {
  moduleId?: string;
  moduleName?: string;
};

/**
 * Orchestrates the full digestion pipeline:
 * fetch → parse → detect language → find modules → run agents → save results
 */
export class DigestOrchestrator {
  public readonly events = new EventEmitter();

  constructor(
    private registry: ModuleRegistry,
    private llm: LLMClient,
    private db: Database,
  ) {}

  /**
   * Run the full digestion pipeline for an article.
   */
  async orchestrate(articleId: string): Promise<void> {
    // 1. Get article from DB
    const article = await this.db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });

    if (!article) {
      throw new Error(`Article not found: ${articleId}`);
    }

    // Mark as processing
    await this.db
      .update(articles)
      .set({ status: "processing" })
      .where(eq(articles.id, articleId));

    try {
      // 2. Fetch and extract content
      this.emit(articleId, { type: "status", message: "Extracting content..." });

      const content = await fetchAndExtract(article.sourceUrl);

      await this.db
        .update(articles)
        .set({
          rawContent: content.text,
          title: content.title,
          wordCount: content.wordCount,
        })
        .where(eq(articles.id, articleId));

      // 3. Detect language
      const language = detectLanguage(content.text);

      await this.db
        .update(articles)
        .set({ language })
        .where(eq(articles.id, articleId));

      // 4. Build content input
      const input: ContentInput = {
        id: articleId,
        sourceUrl: article.sourceUrl,
        title: content.title,
        content: content.text,
        language,
        contentType: "article",
        wordCount: content.wordCount,
        metadata: {},
      };

      // 5. Find applicable modules
      const applicable = this.registry.findApplicable(input);
      this.emit(articleId, {
        type: "status",
        message: `${applicable.length} digestive enzyme(s) starting...`,
      });

      if (applicable.length === 0) {
        console.warn(`[Orchestrator] No applicable modules for article ${articleId}`);
      }

      // 6. Run all agents in parallel
      const results = await Promise.allSettled(
        applicable.map((mod) => this.runAgent(articleId, mod, input)),
      );

      // Log failures
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "rejected") {
          const err = (results[i] as PromiseRejectedResult).reason;
          console.error(
            `[Orchestrator] Module "${applicable[i].manifest.id}" failed:`,
            err,
          );
          this.emit(articleId, {
            type: "error",
            error: `Module "${applicable[i].manifest.name}" failed: ${err}`,
            recoverable: true,
            moduleId: applicable[i].manifest.id,
            moduleName: applicable[i].manifest.name,
          });
        }
      }

      // 7. Done
      await this.db
        .update(articles)
        .set({ status: "done" })
        .where(eq(articles.id, articleId));

      this.emit(articleId, {
        type: "status",
        message: "Digestion complete!",
      });
    } catch (error) {
      // Pipeline-level failure
      await this.db
        .update(articles)
        .set({ status: "failed" })
        .where(eq(articles.id, articleId));

      this.emit(articleId, {
        type: "error",
        error: `Pipeline failed: ${error}`,
        recoverable: false,
      });

      throw error;
    }
  }

  /**
   * Run a single module's agent and save its outputs.
   */
  private async runAgent(
    articleId: string,
    mod: DigestModule,
    input: ContentInput,
  ): Promise<void> {
    const { id: moduleId, name: moduleName } = mod.manifest;

    // Build runtime for this module
    const runtime = this.buildRuntime(moduleId);
    const agent = mod.createAgent(runtime);

    this.emit(articleId, {
      type: "status",
      message: `${moduleName} analyzing...`,
      moduleId,
      moduleName,
    });

    // Iterate through agent events
    for await (const event of agent.digest(input)) {
      // Forward event with module context
      this.emit(articleId, { ...event, moduleId, moduleName });

      // Save result outputs to DB
      if (event.type === "result") {
        const output = event.output;

        await this.db.insert(digests).values({
          articleId,
          moduleId,
          kind: output.kind,
          data: output.data,
        });

        // Flashcards get an extra copy in the flashcards table
        if (output.kind === "flashcard") {
          // Look up the article to get deviceId
          const article = await this.db.query.articles.findFirst({
            where: eq(articles.id, articleId),
            columns: { deviceId: true },
          });

          if (article) {
            await this.db.insert(flashcards).values({
              deviceId: article.deviceId,
              articleId,
              front: output.data.front,
              back: output.data.back,
              tags: output.data.tags,
            });
          }
        }
      }
    }
  }

  /**
   * Build an AgentRuntime for a specific module.
   */
  private buildRuntime(moduleId: string): AgentRuntime {
    const userConfig: UserConfig = {
      language: "zh",
      level: "intermediate",
      moduleConfig: {},
    };

    return {
      llm: this.llm,
      tools: {
        async webSearch() {
          // TODO: implement web search tool
          return [];
        },
        async fetchUrl(url: string) {
          const res = await fetch(url);
          return res.text();
        },
      },
      userConfig,
      log: {
        info: (msg: string) => console.log(`[${moduleId}] ${msg}`),
        warn: (msg: string) => console.warn(`[${moduleId}] ${msg}`),
        error: (msg: string, err?: Error) =>
          console.error(`[${moduleId}] ${msg}`, err ?? ""),
      },
    };
  }

  /**
   * Emit an event for a specific article.
   * Frontend can subscribe via SSE on `digest:{articleId}`.
   */
  private emit(articleId: string, event: OrchestrationEvent): void {
    this.events.emit(`digest:${articleId}`, event);
    // Also log for debugging
    if (event.type === "status") {
      console.log(`[Orchestrator:${articleId.slice(0, 8)}] ${event.message}`);
    }
  }
}
