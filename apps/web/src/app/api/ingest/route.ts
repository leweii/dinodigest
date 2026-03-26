import { NextResponse } from "next/server";
import { articles } from "@dinodigest/db";
import { getDB, getDigestQueue } from "@/lib/server";
import { getOrCreateDevice } from "@/lib/device";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Get or create device
    const deviceId = await getOrCreateDevice();

    // Create article record
    const db = getDB();
    const [article] = await db
      .insert(articles)
      .values({
        deviceId,
        sourceUrl: url,
        status: "pending",
      })
      .returning({ id: articles.id });

    // Add job to queue
    const queue = getDigestQueue();
    await queue.add("digest", { articleId: article.id }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    });

    return NextResponse.json({ articleId: article.id });
  } catch (error) {
    console.error("[API /ingest] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
