"use client";

/**
 * DinoDigest mascot — cute upright cartoon dinosaur.
 *
 * Inspired by childlike hand-drawn style:
 * - Standing upright, chubby body
 * - Big head with wide toothy grin
 * - Large round eyes
 * - Triangular back spikes
 * - Tiny T-rex arms
 * - Green with lighter belly
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
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 220"
        width={size}
        height={(size * 220) / 200}
        className="select-none overflow-visible"
        role="img"
        aria-label="DinoDigest mascot"
      >
        {/* ===== TAIL ===== */}
        <path
          d="M 55 155 Q 25 150, 18 130 Q 12 115, 22 108 Q 28 105, 32 110"
          fill="#5B9A3C"
          stroke="#3d6b28"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={state === "happy" ? "animate-tail-wag" : ""}
        />

        {/* ===== BODY — chubby upright pear shape ===== */}
        <ellipse
          cx="95" cy="148" rx="48" ry="52"
          fill="#6BB344"
          stroke="#3d6b28"
          strokeWidth="2"
        />

        {/* ===== BELLY — lighter area ===== */}
        <ellipse
          cx="100" cy="155" rx="28" ry="35"
          fill="#95D06B"
          stroke="none"
        />

        {/* ===== LEGS ===== */}
        {/* Left leg */}
        <path
          d="M 70 190 L 65 210 Q 62 215, 55 215 L 50 215"
          fill="none"
          stroke="#3d6b28"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="55" cy="215" rx="12" ry="5" fill="#6BB344" stroke="#3d6b28" strokeWidth="2" />

        {/* Right leg */}
        <path
          d="M 115 190 L 120 210 Q 123 215, 130 215 L 135 215"
          fill="none"
          stroke="#3d6b28"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="130" cy="215" rx="12" ry="5" fill="#6BB344" stroke="#3d6b28" strokeWidth="2" />

        {/* ===== ARMS — tiny, cute ===== */}
        {/* Left arm */}
        <path
          d="M 52 128 Q 35 120, 30 130 Q 28 135, 32 138"
          fill="none"
          stroke="#3d6b28"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={state === "chewing" ? "animate-arm-grab" : ""}
        />

        {/* Right arm */}
        <path
          d="M 138 128 Q 155 120, 160 130 Q 162 135, 158 138"
          fill="none"
          stroke="#3d6b28"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ===== HEAD — big, round, tilted slightly up ===== */}
        <ellipse
          cx="100" cy="80" rx="48" ry="42"
          fill="#6BB344"
          stroke="#3d6b28"
          strokeWidth="2"
        />

        {/* ===== SNOUT — bumpy nose area ===== */}
        <ellipse
          cx="135" cy="75" rx="22" ry="18"
          fill="#6BB344"
          stroke="#3d6b28"
          strokeWidth="2"
        />

        {/* ===== NOSTRILS ===== */}
        <circle cx="148" cy="68" r="2.5" fill="#3d6b28" />
        <circle cx="142" cy="66" r="2" fill="#3d6b28" />

        {/* ===== BACK SPIKES — zigzag triangles ===== */}
        <polygon points="62,52 55,30 70,50" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
        <polygon points="74,44 70,18 84,40" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
        <polygon points="88,42 87,15 98,38" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
        <polygon points="100,44 102,20 112,42" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />

        {/* ===== MOUTH ===== */}
        {state === "happy" ? (
          /* Happy: big smile, closed mouth */
          <path
            d="M 108 92 Q 130 105, 148 92"
            fill="none"
            stroke="#3d6b28"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ) : (
          /* Idle / Chewing: mouth open with teeth */
          <g className={state === "chewing" ? "animate-jaw" : ""}>
            {/* Mouth opening */}
            <path
              d={state === "chewing"
                ? "M 108 88 Q 130 85, 152 88 Q 150 95, 130 96 Q 110 95, 108 88 Z"
                : "M 108 88 Q 130 82, 152 88 Q 148 102, 130 105 Q 112 102, 108 88 Z"
              }
              fill="#E85D5D"
              stroke="#3d6b28"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Upper teeth */}
            <polygon points="115,88 118,94 121,88" fill="white" stroke="none" />
            <polygon points="124,87 127,93 130,87" fill="white" stroke="none" />
            <polygon points="133,87 136,93 139,87" fill="white" stroke="none" />
            <polygon points="142,88 145,94 148,88" fill="white" stroke="none" />
            {/* Lower teeth (only when wide open) */}
            {state === "idle" && (
              <>
                <polygon points="118,102 121,96 124,102" fill="white" stroke="none" />
                <polygon points="129,103 132,97 135,103" fill="white" stroke="none" />
                <polygon points="140,102 143,96 146,102" fill="white" stroke="none" />
              </>
            )}
          </g>
        )}

        {/* ===== EYES — big, round, expressive ===== */}
        {state === "happy" ? (
          /* Happy: upside-down U eyes */
          <>
            <path d="M 82 70 Q 88 60, 94 70" fill="none" stroke="#3d6b28" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 108 68 Q 114 58, 120 68" fill="none" stroke="#3d6b28" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Left eye */}
            <circle cx="88" cy="68" r="11" fill="white" stroke="#3d6b28" strokeWidth="2" />
            <circle cx="90" cy="66" r="5.5" fill="#2d2d2d" />
            <circle cx="88" cy="64" r="2" fill="white" />

            {/* Right eye */}
            <circle cx="114" cy="66" r="11" fill="white" stroke="#3d6b28" strokeWidth="2" />
            <circle cx="116" cy="64" r="5.5" fill="#2d2d2d" />
            <circle cx="114" cy="62" r="2" fill="white" />
          </>
        )}

        {/* ===== HAPPY DECORATIONS ===== */}
        {state === "happy" && (
          <>
            {/* Blush cheeks */}
            <ellipse cx="80" cy="82" rx="7" ry="4" fill="#fca5a5" opacity="0.5" />
            <ellipse cx="130" cy="82" rx="7" ry="4" fill="#fca5a5" opacity="0.5" />

            {/* Sparkles */}
            <g className="animate-sparkle">
              <line x1="55" y1="45" x2="55" y2="35" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <line x1="50" y1="40" x2="60" y2="40" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g className="animate-sparkle-delay">
              <line x1="150" y1="40" x2="150" y2="30" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <line x1="145" y1="35" x2="155" y2="35" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </g>
          </>
        )}

        {/* ===== CHEWING DECORATIONS ===== */}
        {state === "chewing" && (
          <g>
            <circle cx="160" cy="95" r="2" fill="#3d6b28" className="animate-particle-1" opacity="0.5" />
            <circle cx="155" cy="100" r="1.5" fill="#3d6b28" className="animate-particle-2" opacity="0.5" />
            <circle cx="162" cy="88" r="1.5" fill="#3d6b28" className="animate-particle-3" opacity="0.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
