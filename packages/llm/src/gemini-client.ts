import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";
import type { LLMClient } from "@dinodigest/module-sdk";

export interface GeminiClientConfig {
  /** Google AI Studio API key (simplest, recommended for dev) */
  apiKey?: string;
  /** Vertex AI project ID (alternative to apiKey) */
  projectId?: string;
  /** Vertex AI location (required if using projectId) */
  location?: string;
  /** Model name, defaults to gemini-2.0-flash */
  model?: string;
}

/**
 * Create a Gemini LLM client.
 *
 * Supports two authentication modes:
 * 1. API key (from Google AI Studio) — set GEMINI_API_KEY
 * 2. Vertex AI (service account) — set GOOGLE_CLOUD_PROJECT + GOOGLE_APPLICATION_CREDENTIALS
 */
export function createGeminiClient(config: GeminiClientConfig): LLMClient {
  // When using API key mode, strip ALL Google Cloud env vars so the SDK
  // doesn't auto-detect Vertex AI credentials from the system environment
  if (config.apiKey) {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.GOOGLE_CLOUD_PROJECT;
    delete process.env.GOOGLE_CLOUD_LOCATION;
    delete process.env.GCLOUD_PROJECT;
    delete process.env.CLOUDSDK_CORE_PROJECT;
  }

  let ai: GoogleGenAI;

  if (config.apiKey) {
    ai = new GoogleGenAI({ apiKey: config.apiKey });
  } else if (config.projectId) {
    ai = new GoogleGenAI({
      vertexai: true,
      project: config.projectId,
      location: config.location ?? "us-central1",
    });
  } else {
    throw new Error(
      "Either apiKey (GEMINI_API_KEY) or projectId (GOOGLE_CLOUD_PROJECT) must be provided",
    );
  }

  const modelName = config.model ?? process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  console.log(`[LLM] Using model: ${modelName}, mode: ${config.apiKey ? "API key" : "Vertex AI"}`);

  return {
    async generate(prompt: string): Promise<string> {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }
      return text;
    },

    async generateStructured<T>(
      prompt: string,
      schema: z.ZodSchema<T>,
    ): Promise<T> {
      const jsonPrompt = `${prompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation — just the JSON object.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: jsonPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini (structured)");
      }

      // Clean up response — strip markdown fences if present
      let cleaned = text.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);
      return schema.parse(parsed);
    },

    async *generateStream(
      prompt: string,
    ): AsyncGenerator<string, void, unknown> {
      const response = await ai.models.generateContentStream({
        model: modelName,
        contents: prompt,
      });

      for await (const chunk of response) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    },
  };
}
