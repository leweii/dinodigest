import { eq } from "drizzle-orm";
import { articles } from "@dinodigest/db";
import { getDB } from "@/lib/server";

/**
 * SSE endpoint for real-time digest processing events.
 *
 * Since the worker runs as a separate process, we poll the article status
 * from the database. For production, this would use Redis pub/sub.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDB();

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Poll for status changes
      let lastStatus = "";
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }

        try {
          const article = await db.query.articles.findFirst({
            where: eq(articles.id, id),
            columns: { status: true, title: true },
          });

          if (!article) {
            send({ type: "error", error: "Article not found", recoverable: false });
            clearInterval(interval);
            controller.close();
            closed = true;
            return;
          }

          if (article.status !== lastStatus) {
            lastStatus = article.status;

            if (article.status === "processing") {
              send({ type: "status", message: "Digesting..." });
              send({ type: "progress", percent: 30 });
            } else if (article.status === "done") {
              send({ type: "status", message: "Digestion complete!" });
              send({ type: "progress", percent: 100 });
              clearInterval(interval);
              setTimeout(() => {
                if (!closed) {
                  controller.close();
                  closed = true;
                }
              }, 500);
            } else if (article.status === "failed") {
              send({ type: "error", error: "Digestion failed", recoverable: true });
              clearInterval(interval);
              controller.close();
              closed = true;
            }
          }
        } catch {
          // DB query failed, keep trying
        }
      }, 1000);

      // Initial event
      send({ type: "status", message: "Starting digestion..." });
      send({ type: "progress", percent: 10 });

      // Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
