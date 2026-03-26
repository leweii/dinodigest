import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export interface FetchedContent {
  title: string;
  text: string;
  wordCount: number;
}

/**
 * Fetch a URL and extract clean article text.
 * Uses Mozilla Readability for article extraction.
 */
export async function fetchAndExtract(url: string): Promise<FetchedContent> {
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`Unsupported protocol: ${parsedUrl.protocol}`);
  }

  // Fetch HTML
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

  // Parse with linkedom (lightweight DOM for Node.js)
  const { document } = parseHTML(html);

  // Extract article with Readability
  // linkedom's document is compatible with Readability
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reader = new Readability(document as any);
  const article = reader.parse();

  if (!article || !article.textContent?.trim()) {
    throw new Error("Could not extract article content from URL");
  }

  const text = article.textContent.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return {
    title: article.title || parsedUrl.hostname,
    text,
    wordCount,
  };
}
