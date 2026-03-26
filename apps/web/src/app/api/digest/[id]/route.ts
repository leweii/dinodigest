import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { articles, digests } from "@dinodigest/db";
import { getDB } from "@/lib/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDB();

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, id),
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const digestResults = await db.query.digests.findMany({
    where: eq(digests.articleId, id),
  });

  return NextResponse.json({
    article: {
      id: article.id,
      sourceUrl: article.sourceUrl,
      title: article.title,
      language: article.language,
      wordCount: article.wordCount,
      status: article.status,
      createdAt: article.createdAt,
    },
    digests: digestResults.map((d) => ({
      id: d.id,
      moduleId: d.moduleId,
      kind: d.kind,
      data: d.data,
    })),
  });
}
