"use client";

/**
 * DinoDigest mascot — Picasso-inspired line art dinosaur.
 * Minimal, playful, one continuous stroke feeling.
 * Three states: idle (mouth open), chewing, happy.
 */
export function Dino({
  state = "idle",
  size = 200,
  className = "",
}: {
  state: "idle" | "chewing" | "happy";
  size?: number;
  className?: string;
}) {
  const s = size / 240; // scale factor (designed at 240x240)

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 240 240"
        width={size}
        height={size}
        className="select-none overflow-visible"
        style={{ transform: `scale(${s > 0 ? 1 : 1})` }}
      >
        {/* === Picasso-style line art dino === */}
        {/* All strokes use a single color, varying weight for expression */}

        {/* Tail — loose, expressive curve */}
        <path
          d="M 30 155 Q 15 140 20 120 Q 25 100 40 105"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="3"
          strokeLinecap="round"
          className={state === "happy" ? "animate-tail-wag" : ""}
        />

        {/* Body — single bold curve */}
        <path
          d="M 40 105 Q 50 80 80 75 Q 95 73 105 80 L 105 155 Q 100 175 80 178 Q 55 180 45 165 Z"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Belly line — Picasso detail */}
        <path
          d="M 55 110 Q 70 135 90 130"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Back spikes — playful triangles, hand-drawn feel */}
        <path
          d="M 58 82 L 52 60 L 68 78"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 72 75 L 70 48 L 85 73"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 88 74 L 90 52 L 100 76"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Head — large, expressive, connected to body */}
        <path
          d="M 105 80 Q 115 65 140 60 Q 170 55 185 65 Q 200 75 200 90 Q 200 105 185 112 L 105 112 L 105 80"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Upper jaw / snout — extends right */}
        <path
          d="M 185 112 Q 210 108 220 100 Q 225 95 220 88 Q 215 82 200 85"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Nostril */}
        <circle cx="215" cy="90" r="2" fill="#2d2d2d" />

        {/* Lower jaw — animated for chewing */}
        <path
          d={
            state === "chewing"
              ? "M 185 112 Q 210 118 220 112 Q 225 108 218 105"
              : state === "happy"
                ? "M 185 112 Q 200 118 210 112"
                : "M 185 112 Q 210 125 220 118 Q 228 112 222 105"
          }
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={state === "chewing" ? "animate-jaw" : ""}
        />

        {/* Teeth — small zigzag on upper jaw */}
        {state !== "happy" && (
          <path
            d="M 192 112 L 195 117 L 198 112 L 201 117 L 204 112 L 207 117 L 210 112"
            fill="none"
            stroke="#2d2d2d"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={state === "chewing" ? "animate-chew-teeth" : ""}
          />
        )}

        {/* Eye — large, expressive, Picasso-style */}
        <circle
          cx="155"
          cy="82"
          r="12"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2.5"
        />
        <circle
          cx={state === "happy" ? "157" : "156"}
          cy={state === "happy" ? "80" : "82"}
          r="5"
          fill="#2d2d2d"
        />
        {/* Eye highlight */}
        <circle cx="153" cy="78" r="2" fill="white" />

        {/* Happy — closed eye (arc), replaces circle eye */}
        {state === "happy" && (
          <path
            d="M 145 80 Q 155 72 165 80"
            fill="none"
            stroke="#2d2d2d"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Eyebrow — expressive line */}
        <path
          d={
            state === "happy"
              ? "M 145 70 Q 155 64 165 68"
              : "M 143 72 Q 155 66 167 72"
          }
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Arms — tiny, cute T-rex arms */}
        <path
          d="M 105 105 Q 115 100 120 108 L 118 115"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={state === "chewing" ? "animate-arm-grab" : ""}
        />
        <path
          d="M 105 115 Q 115 112 118 120 L 115 125"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Legs — sturdy, simple */}
        <path
          d="M 60 170 L 55 200 L 45 200"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 85 172 L 88 200 L 78 200"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Toes */}
        <path d="M 45 200 L 40 198" fill="none" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" />
        <path d="M 45 200 L 42 203" fill="none" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" />
        <path d="M 78 200 L 73 198" fill="none" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" />
        <path d="M 78 200 L 75 203" fill="none" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" />

        {/* Happy sparkles */}
        {state === "happy" && (
          <>
            <g className="animate-sparkle">
              <line x1="130" y1="50" x2="130" y2="40" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <line x1="125" y1="45" x2="135" y2="45" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g className="animate-sparkle-delay">
              <line x1="180" y1="55" x2="180" y2="45" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <line x1="175" y1="50" x2="185" y2="50" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g className="animate-sparkle" style={{ animationDelay: "0.3s" }}>
              <line x1="205" y1="70" x2="205" y2="62" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="201" y1="66" x2="209" y2="66" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </>
        )}

        {/* Blush — happy state */}
        {state === "happy" && (
          <ellipse cx="170" cy="95" rx="8" ry="4" fill="#fca5a5" opacity="0.5" />
        )}

        {/* Chewing — food particles */}
        {state === "chewing" && (
          <>
            <circle cx="225" cy="108" r="1.5" fill="#2d2d2d" className="animate-particle-1" />
            <circle cx="230" cy="104" r="1" fill="#2d2d2d" className="animate-particle-2" />
            <circle cx="222" cy="115" r="1.5" fill="#2d2d2d" className="animate-particle-3" />
          </>
        )}
      </svg>
    </div>
  );
}
