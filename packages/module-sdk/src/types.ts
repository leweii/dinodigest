import type { z } from "zod";

// ============================================================
// Content Types
// ============================================================

/** Supported content types that modules can process */
export type ContentType = "article" | "paper" | "documentation" | "code";

/** Supported output kinds that modules can produce */
export type OutputKind = "summary" | "key_point" | "flashcard" | "quiz" | "mind_map";

// ============================================================
// Module Manifest — declares what a module is and can do
// ============================================================

export interface ModuleManifest {
  /** Unique identifier. Use kebab-case. Example: 'vocab-flashcard' */
  id: string;

  /** Human-readable display name. Example: 'Vocabulary Flashcards' */
  name: string;

  /** Description of what this module does */
  description: string;

  /** Semantic version. Example: '1.0.0' */
  version: string;

  /** Author name */
  author: string;

  /** What content this module can process */
  accepts: {
    /** Content types this module handles */
    contentTypes: ContentType[];

    /** ISO 639-1 language codes. Omit to accept all languages. */
    languages?: string[];

    /** Minimum content length in words. Omit for no minimum. */
    minContentLength?: number;
  };

  /** What output kinds this module produces */
  outputs: OutputKind[];

  /** Optional Zod schema for user-configurable settings */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configSchema?: z.ZodSchema<any>;
}

// ============================================================
// Module Entry Point
// ============================================================

export interface DigestModule {
  manifest: ModuleManifest;

  /**
   * Create an agent instance for processing a single article.
   * Called once per digestion job.
   */
  createAgent(runtime: AgentRuntime): DigestAgent;
}

// ============================================================
// Agent — the actual worker that processes content
// ============================================================

export interface DigestAgent {
  /**
   * Process content and yield events.
   *
   * AsyncGenerator enables:
   * - Real-time status updates to the user
   * - Progress tracking
   * - Streaming partial results as they're generated
   * - Multi-step LLM processing
   *
   * If the agent throws, the orchestrator catches the error
   * and marks this module as failed. Other modules are NOT affected.
   */
  digest(input: ContentInput): AsyncGenerator<DigestEvent, void, unknown>;
}

// ============================================================
// Agent Runtime — capabilities injected into agents by platform
// ============================================================

export interface LLMClient {
  /** Simple text generation */
  generate(prompt: string): Promise<string>;

  /**
   * Structured generation — returns parsed, validated, typed output.
   * Pass a Zod schema and get back a typed object.
   */
  generateStructured<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T>;

  /** Streaming text generation — yields chunks */
  generateStream(prompt: string): AsyncGenerator<string, void, unknown>;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface AgentTools {
  /** Web search */
  webSearch(query: string): Promise<SearchResult[]>;

  /** Fetch content from a URL */
  fetchUrl(url: string): Promise<string>;
}

export interface UserConfig {
  /** User's native language (ISO 639-1) */
  language: string;

  /** User's knowledge level */
  level: "beginner" | "intermediate" | "advanced";

  /** Module-specific configuration (from configSchema) */
  moduleConfig: Record<string, unknown>;
}

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: Error): void;
}

export interface AgentRuntime {
  /** LLM client — abstracted, module doesn't need to know which model */
  llm: LLMClient;

  /** Tools the agent can use */
  tools: AgentTools;

  /** User's configuration and preferences */
  userConfig: UserConfig;

  /** Logger */
  log: Logger;
}

// ============================================================
// Content Input — what agents receive
// ============================================================

export interface ContentInput {
  /** Article UUID */
  id: string;

  /** Original URL submitted by user */
  sourceUrl: string;

  /** Article title (extracted from page) */
  title: string;

  /** Clean article text (HTML stripped, ads removed) */
  content: string;

  /** Detected language (ISO 639-1) */
  language: string;

  /** Content classification */
  contentType: ContentType;

  /** Word count */
  wordCount: number;

  /** Additional metadata */
  metadata: Record<string, unknown>;
}

// ============================================================
// Digest Events — emitted by agents during processing
// ============================================================

/** Status message shown to the user */
export interface StatusEvent {
  type: "status";
  message: string;
}

/** Progress percentage (0-100) */
export interface ProgressEvent {
  type: "progress";
  percent: number;
}

/** A digested output result */
export interface ResultEvent {
  type: "result";
  output: DigestOutput;
}

/** Error during processing */
export interface ErrorEvent {
  type: "error";
  error: string;
  recoverable: boolean;
}

export type DigestEvent = StatusEvent | ProgressEvent | ResultEvent | ErrorEvent;

// ============================================================
// Digest Outputs — standardized output types
// ============================================================

export interface SummaryOutput {
  kind: "summary";
  data: {
    title: string;
    content: string;
    bulletPoints: string[];
  };
}

export interface KeyPointOutput {
  kind: "key_point";
  data: {
    concept: string;
    explanation: string;
    analogy?: string;
    difficulty: number; // 1-5
  };
}

export interface FlashcardOutput {
  kind: "flashcard";
  data: {
    front: string;
    back: string;
    tags: string[];
  };
}

export interface QuizOutput {
  kind: "quiz";
  data: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

export interface MindMapOutput {
  kind: "mind_map";
  data: MindMapNode;
}

export type DigestOutput =
  | SummaryOutput
  | KeyPointOutput
  | FlashcardOutput
  | QuizOutput
  | MindMapOutput;
