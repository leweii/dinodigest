import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { flashcards } from "@dinodigest/db";
import { getDB } from "@/lib/server";
import { sm2 } from "@/lib/sm2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardId, quality } = body as { cardId?: string; quality?: number };

    if (!cardId || quality === undefined || quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: "cardId and quality (0-5) are required" },
        { status: 400 },
      );
    }

    const db = getDB();

    const card = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, cardId),
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Calculate next review using SM-2
    const result = sm2(quality, {
      repetitions: card.repetitions,
      easeFactor: card.easeFactor,
      interval: card.interval,
    });

    // Update card
    await db
      .update(flashcards)
      .set({
        repetitions: result.repetitions,
        easeFactor: result.easeFactor,
        interval: result.interval,
        nextReviewAt: result.nextReviewAt,
      })
      .where(eq(flashcards.id, cardId));

    return NextResponse.json({ success: true, nextReviewAt: result.nextReviewAt });
  } catch (error) {
    console.error("[API /review/score] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
