"use client";

/**
 * DinoDigest mascot — simple SVG dinosaur with 3 states.
 * Uses CSS animations for mouth movement and expressions.
 */
export function Dino({
  state = "idle",
  size = 200,
}: {
  state: "idle" | "chewing" | "happy";
  size?: number;
}) {
  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="select-none"
      >
        {/* Body */}
        <ellipse
          cx="100"
          cy="130"
          rx="55"
          ry="50"
          fill="#4CAF50"
          stroke="#388E3C"
          strokeWidth="2"
        />

        {/* Head */}
        <ellipse
          cx="100"
          cy="70"
          rx="42"
          ry="38"
          fill="#66BB6A"
          stroke="#388E3C"
          strokeWidth="2"
        />

        {/* Eye left */}
        <circle cx="82" cy="58" r="8" fill="white" stroke="#333" strokeWidth="1.5" />
        <circle
          cx={state === "happy" ? "84" : "83"}
          cy="57"
          r="4"
          fill="#333"
          className={state === "idle" ? "animate-blink" : ""}
        />

        {/* Eye right */}
        <circle cx="118" cy="58" r="8" fill="white" stroke="#333" strokeWidth="1.5" />
        <circle
          cx={state === "happy" ? "116" : "117"}
          cy="57"
          r="4"
          fill="#333"
          className={state === "idle" ? "animate-blink" : ""}
        />

        {/* Mouth - upper jaw */}
        <path
          d="M 70 80 Q 100 85 130 80"
          fill="none"
          stroke="#388E3C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Mouth - lower jaw (animated for chewing) */}
        <path
          d={state === "happy"
            ? "M 75 82 Q 100 95 125 82"  // smile
            : "M 75 82 Q 100 88 125 82"   // normal
          }
          fill={state === "idle" ? "#E53935" : state === "chewing" ? "#E53935" : "none"}
          stroke="#388E3C"
          strokeWidth="2"
          strokeLinecap="round"
          className={state === "chewing" ? "animate-chew" : ""}
        />

        {/* Teeth (visible when mouth open / idle) */}
        {(state === "idle" || state === "chewing") && (
          <>
            <rect x="84" y="80" width="5" height="5" fill="white" rx="1"
              className={state === "chewing" ? "animate-chew-teeth" : ""} />
            <rect x="94" y="80" width="5" height="5" fill="white" rx="1"
              className={state === "chewing" ? "animate-chew-teeth" : ""} />
            <rect x="104" y="80" width="5" height="5" fill="white" rx="1"
              className={state === "chewing" ? "animate-chew-teeth" : ""} />
          </>
        )}

        {/* Spikes on back */}
        <polygon points="72,45 78,25 84,45" fill="#43A047" />
        <polygon points="88,38 95,15 102,38" fill="#43A047" />
        <polygon points="105,42 112,22 119,42" fill="#43A047" />

        {/* Arms */}
        <ellipse cx="60" cy="120" rx="12" ry="6" fill="#4CAF50" stroke="#388E3C" strokeWidth="1.5"
          transform="rotate(-30 60 120)" />
        <ellipse cx="140" cy="120" rx="12" ry="6" fill="#4CAF50" stroke="#388E3C" strokeWidth="1.5"
          transform="rotate(30 140 120)" />

        {/* Feet */}
        <ellipse cx="78" cy="172" rx="16" ry="8" fill="#4CAF50" stroke="#388E3C" strokeWidth="1.5" />
        <ellipse cx="122" cy="172" rx="16" ry="8" fill="#4CAF50" stroke="#388E3C" strokeWidth="1.5" />

        {/* Tail */}
        <path
          d="M 45 140 Q 25 145 15 130 Q 10 120 20 115"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Happy sparkles */}
        {state === "happy" && (
          <>
            <text x="145" y="45" fontSize="18" className="animate-sparkle">✨</text>
            <text x="40" y="40" fontSize="14" className="animate-sparkle-delay">✨</text>
          </>
        )}

        {/* Blush when happy */}
        {state === "happy" && (
          <>
            <ellipse cx="72" cy="72" rx="8" ry="5" fill="#FF8A80" opacity="0.5" />
            <ellipse cx="128" cy="72" rx="8" ry="5" fill="#FF8A80" opacity="0.5" />
          </>
        )}
      </svg>
    </div>
  );
}
