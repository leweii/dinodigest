import { NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { articles, digests } from "@dinodigest/db";
import { getDB } from "@/lib/server";
import { getOrCreateDevice } from "@/lib/device";

export async function GET() {
  try {
    const deviceId = await getOrCreateDevice();
    const db = getDB();

    // Get all articles for this device, newest first
    const articleList = await db.query.articles.findMany({
      where: eq(articles.deviceId, deviceId),
      orderBy: desc(articles.createdAt),
      limit: 50,
    });

    // Get digest counts per article
    const articlesWithCounts = await Promise.all(
      articleList.map(async (article) => {
        const digestCounts = await db
          .select({
            kind: digests.kind,
            count: sql<number>`count(*)::int`,
          })
          .from(digests)
          .where(eq(digests.articleId, article.id))
          .groupBy(digests.kind);

        const counts: Record<string, number> = {};
        for (const row of digestCounts) {
          counts[row.kind] = row.count;
        }

        return {
          id: article.id,
          sourceUrl: article.sourceUrl,
          title: article.title,
          status: article.status,
          wordCount: article.wordCount,
          createdAt: article.createdAt,
          digestCounts: counts,
        };
      }),
    );

    return NextResponse.json({ articles: articlesWithCounts });
  } catch (error) {
    console.error("[API /history] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
