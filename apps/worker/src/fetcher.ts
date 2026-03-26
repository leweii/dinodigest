import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export interface FetchedContent {
  title: string;
  text: string;
  wordCount: number;
}

// Minimum word count to consider Readability extraction successful
const MIN_WORD_COUNT = 100;

async function fetchWithReadability(url: string, parsedUrl: URL): Promise<FetchedContent> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  if (!html.trim()) {
    throw new Error("Empty response from URL");
  }

  const { document } = parseHTML(html);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reader = new Readability(document as any);
  const article = reader.parse();

  if (!article || !article.textContent?.trim()) {
    throw new Error("Could not extract article content from URL");
  }

  const text = article.textContent.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (wordCount < MIN_WORD_COUNT) {
    throw new Error(`Extracted content too short: ${wordCount} words`);
  }

  return {
    title: article.title || parsedUrl.hostname,
    text,
    wordCount,
  };
}

async function fetchWithJina(url: string, parsedUrl: URL): Promise<FetchedContent> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const response = await fetch(jinaUrl, {
    headers: {
      Accept: "text/plain",
      "X-Return-Format": "text",
    },
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw new Error(`Jina fetch failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (!text.trim()) {
    throw new Error("Empty response from Jina");
  }

  // Jina prepends "Title: ..." and "URL Source: ..." lines — extract title if present
  const titleMatch = text.match(/^Title:\s*(.+)$/m);
  const title = titleMatch?.[1]?.trim() || parsedUrl.hostname;

  // Strip Jina metadata header lines before counting words
  const body = text.replace(/^(Title|URL Source|Published Time):.*$/gm, "").trim();
  const wordCount = body.split(/\s+/).filter(Boolean).length;

  return { title, text: body, wordCount };
}

/**
 * Fetch a URL and extract clean article text.
 * Primary: Mozilla Readability + linkedom (fast, self-hosted).
 * Fallback: Jina Reader API (handles JS-rendered pages and anti-bot sites).
 */
export async function fetchAndExtract(url: string): Promise<FetchedContent> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`Unsupported protocol: ${parsedUrl.protocol}`);
  }

  try {
    return await fetchWithReadability(url, parsedUrl);
  } catch (readabilityError) {
    console.warn(
      `[fetcher] Readability failed (${(readabilityError as Error).message}), falling back to Jina`
    );
    return await fetchWithJina(url, parsedUrl);
  }
}
