"use client";

import { useEffect, useState } from "react";
import { Dino } from "@/components/dino/dino";

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  tags: string[] | null;
}

export default function ReviewPage() {
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    fetch("/api/review/due")
      .then((r) => r.json())
      .then((data) => {
        setCards(data.cards ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentCard = cards[currentIndex];
  const remaining = cards.length - currentIndex;

  const handleScore = async (quality: number) => {
    if (!currentCard || scoring) return;
    setScoring(true);

    await fetch("/api/review/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: currentCard.id, quality }),
    });

    setScoring(false);
    setFlipped(false);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCards([]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Loading cards...</p>
      </div>
    );
  }

  // No cards due
  if (cards.length === 0 || remaining <= 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center">
        <Dino state="happy" size={140} />
        <h2 className="text-xl font-semibold mt-4 mb-2">All caught up!</h2>
        <p className="text-gray-500">No cards due for review. Come back later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center">
      {/* Progress */}
      <p className="text-sm text-gray-400 mb-6">{remaining} cards remaining</p>

      {/* Card */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={`w-full min-h-[240px] p-8 bg-white border-2 rounded-2xl
                    flex items-center justify-center cursor-pointer
                    transition-all ${
                      flipped
                        ? "border-green-300"
                        : "border-gray-200 hover:border-green-200 hover:shadow-md"
                    }`}
      >
        <div className="text-center w-full">
          {!flipped ? (
            <div>
              <p className="text-2xl font-bold text-gray-900">{currentCard.front}</p>
              <p className="text-xs text-gray-400 mt-4">tap to flip</p>
            </div>
          ) : (
            <div className="text-left whitespace-pre-line text-sm text-gray-700 leading-relaxed">
              {currentCard.back}
            </div>
          )}
        </div>
      </div>

      {/* Rating buttons (visible after flip) */}
      {flipped && (
        <div className="flex gap-2 mt-6 w-full animate-fade-in">
          <button
            onClick={() => handleScore(0)}
            disabled={scoring}
            className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-medium
                       hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            Again
          </button>
          <button
            onClick={() => handleScore(3)}
            disabled={scoring}
            className="flex-1 py-3 bg-amber-50 text-amber-600 rounded-xl font-medium
                       hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            Hard
          </button>
          <button
            onClick={() => handleScore(4)}
            disabled={scoring}
            className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl font-medium
                       hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            Good
          </button>
          <button
            onClick={() => handleScore(5)}
            disabled={scoring}
            className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium
                       hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            Easy
          </button>
        </div>
      )}

      {/* Dino encouragement */}
      <div className="mt-8">
        <Dino state={flipped ? "happy" : "idle"} size={60} />
      </div>
    </div>
  );
}
