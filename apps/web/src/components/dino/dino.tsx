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
        className={`select-none overflow-visible ${state === "chewing" ? "animate-body-sway" : ""}`}
        role="img"
        aria-label="DinoDigest 恐龙吉祥物"
      >
        {/* ===== TAIL — thick base merging with body, tapers to tip ===== */}
        <g className={state === "happy" ? "animate-tail-wag" : ""}>
          {/* Tail body — wide at base, curves left and tapers */}
          <path
            d="M 55 145 Q 42 140, 32 135 Q 20 128, 14 118 Q 8 108, 12 100 L 16 98"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tail underside — connects back to body to form closed shape */}
          <path
            d="M 50 160 Q 38 158, 28 152 Q 18 144, 14 132 Q 10 120, 12 110 L 16 98"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tail tip — pointed */}
          <path
            d="M 16 98 L 8 92"
            fill="none"
            stroke="#3d6b28"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Tail spikes — continuing the back spike pattern */}
          <polygon points="40,137 33,122 46,133" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
          <polygon points="28,128 22,112 34,124" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
          <polygon points="18,116 14,102 24,113" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
        </g>

        {/* ===== BODY — chubby upright pear shape ===== */}
        <ellipse
          cx="95" cy="148" rx="48" ry="52"
          fill="#6BB344"
          stroke="#3d6b28"
          strokeWidth="2"
          className={state === "chewing" ? "animate-belly-bounce" : ""}
        />

        {/* ===== BELLY — lighter area ===== */}
        <ellipse
          cx="100" cy="155" rx="28" ry="35"
          fill="#95D06B"
          stroke="none"
          className={state === "chewing" ? "animate-belly-bounce" : ""}
        />

        {/* ===== LEGS with dinosaur clawed feet ===== */}

        {/* Left leg — thick thigh tapering to foot */}
        <path
          d="M 68 185 Q 63 195, 60 205 Q 58 212, 55 215"
          fill="none"
          stroke="#3d6b28"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left foot — 3-toed dinosaur claw */}
        <g>
          {/* Foot base */}
          <path
            d="M 45 213 Q 55 210, 65 213"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Toe 1 — left */}
          <path
            d="M 45 213 L 38 217 L 36 213"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Claw 1 */}
          <path d="M 36 213 L 34 210" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" />
          {/* Toe 2 — center */}
          <path
            d="M 52 213 L 50 219 L 47 215"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Claw 2 */}
          <path d="M 47 215 L 45 212" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" />
          {/* Toe 3 — right */}
          <path
            d="M 62 213 L 65 218 L 62 214"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Claw 3 */}
          <path d="M 62 214 L 60 211" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Right leg */}
        <path
          d="M 118 185 Q 123 195, 125 205 Q 127 212, 130 215"
          fill="none"
          stroke="#3d6b28"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right foot — 3-toed dinosaur claw */}
        <g>
          {/* Foot base */}
          <path
            d="M 120 213 Q 130 210, 142 213"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Toe 1 */}
          <path
            d="M 120 213 L 115 218 L 113 214"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 113 214 L 111 211" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" />
          {/* Toe 2 */}
          <path
            d="M 129 213 L 128 219 L 125 215"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 125 215 L 123 212" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" />
          {/* Toe 3 */}
          <path
            d="M 139 213 L 143 218 L 141 214"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 141 214 L 139 211" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ===== ARMS with tiny clawed hands ===== */}

        {/* Left arm */}
        <g className={state === "chewing" ? "animate-arm-grab" : ""}>
          <path
            d="M 52 125 Q 38 118, 32 126 Q 29 132, 33 136"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left hand claws — 2 tiny curved claws */}
          <path d="M 33 136 L 28 138 L 27 134" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 33 136 L 32 141 L 29 139" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Right arm */}
        <g>
          <path
            d="M 138 125 Q 152 118, 158 126 Q 161 132, 157 136"
            fill="#6BB344"
            stroke="#3d6b28"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right hand claws */}
          <path d="M 157 136 L 162 138 L 163 134" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 157 136 L 158 141 L 161 139" fill="none" stroke="#3d6b28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

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

        {/* ===== BACK SPIKES — continuous ridge from head to tail ===== */}
        {/* Head spikes (largest) */}
        <polygon points="72,55 65,28 80,50" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
        <polygon points="82,48 78,18 92,44" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
        <polygon points="94,46 93,16 104,42" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
        {/* Upper back spikes (medium, transition) */}
        <polygon points="60,72 52,52 68,68" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
        <polygon points="52,90 44,70 58,86" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />
        {/* Lower back / body-tail junction spikes (smaller) */}
        <polygon points="48,108 40,90 54,104" fill="#F5A623" stroke="#d4891a" strokeWidth="1" />

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
