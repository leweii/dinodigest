import { NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { articles, digests } from "@dinodigest/db";
import { getDB } from "@/lib/server";
import { getOrCreateDevice } from "@/lib/device";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = 10;

    const deviceId = await getOrCreateDevice();
    const db = getDB();

    // Count total articles for this device
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(articles)
      .where(eq(articles.deviceId, deviceId));

    // Get articles for current page, newest first
    const articleList = await db.query.articles.findMany({
      where: eq(articles.deviceId, deviceId),
      orderBy: desc(articles.createdAt),
      limit: pageSize,
      offset: (page - 1) * pageSize,
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

    return NextResponse.json({
      articles: articlesWithCounts,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[API /history] Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
