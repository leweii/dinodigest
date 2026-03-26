import { NextResponse } from "next/server";
import { eq, lte } from "drizzle-orm";
import { flashcards } from "@dinodigest/db";
import { getDB } from "@/lib/server";
import { getOrCreateDevice } from "@/lib/device";

export async function GET() {
  try {
    const deviceId = await getOrCreateDevice();
    const db = getDB();

    const dueCards = await db.query.flashcards.findMany({
      where: eq(flashcards.deviceId, deviceId),
      orderBy: flashcards.nextReviewAt,
    });

    // Filter cards due for review (nextReviewAt <= now)
    const now = new Date();
    const due = dueCards.filter((c) => c.nextReviewAt <= now);

    return NextResponse.json({ cards: due, totalDue: due.length });
  } catch (error) {
    console.error("[API /review/due] Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
