import {
  VertexAI,
  type GenerativeModel,
  type Content,
} from "@google-cloud/vertexai";
import type { z } from "zod";
import type { LLMClient } from "@dinodigest/module-sdk";
import { zodToGeminiSchema } from "./schema-converter.js";

export interface GeminiClientConfig {
  projectId: string;
  location: string;
  model?: string;
}

/**
 * Create a Gemini LLM client that implements the LLMClient interface.
 * Uses Google Vertex AI to call Gemini models.
 */
export function createGeminiClient(config: GeminiClientConfig): LLMClient {
  const vertexAI = new VertexAI({
    project: config.projectId,
    location: config.location,
  });

  const model: GenerativeModel = vertexAI.getGenerativeModel({
    model: config.model ?? "gemini-2.0-flash-001",
  });

  return {
    async generate(prompt: string): Promise<string> {
      const result = await model.generateContent(prompt);
      const response = result.response;
      if (!response.candidates?.[0]?.content?.parts?.[0]) {
        throw new Error("Empty response from Gemini");
      }
      return response.candidates[0].content.parts
        .map((p) => p.text ?? "")
        .join("");
    },

    async generateStructured<T>(
      prompt: string,
      schema: z.ZodSchema<T>,
    ): Promise<T> {
      const geminiSchema = zodToGeminiSchema(schema);

      const contents: Content[] = [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ];

      const result = await model.generateContent({
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: geminiSchema,
        },
      });

      const response = result.response;
      if (!response.candidates?.[0]?.content?.parts?.[0]) {
        throw new Error("Empty response from Gemini (structured)");
      }

      const text = response.candidates[0].content.parts
        .map((p) => p.text ?? "")
        .join("");

      const parsed = JSON.parse(text);
      return schema.parse(parsed);
    },

    async *generateStream(prompt: string): AsyncGenerator<string, void, unknown> {
      const result = await model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        const text = chunk.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("");
        if (text) {
          yield text;
        }
      }
    },
  };
}
