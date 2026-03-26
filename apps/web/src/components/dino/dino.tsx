"use client";

/**
 * DinoDigest mascot — Picasso-inspired line art dinosaur.
 *
 * Design principles:
 * - Single-weight continuous line feel, like a Picasso one-line drawing
 * - Rounded, friendly proportions — big head, small body, stubby limbs
 * - Large expressive eye as focal point
 * - Minimal detail, maximum personality
 * - No fills — pure stroke, ink-on-paper aesthetic
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
  const stroke = "#2d2d2d";
  const w = 2.5; // main stroke weight

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="select-none overflow-visible"
        role="img"
        aria-label="DinoDigest mascot"
      >
        {/* ===== BODY — round, friendly blob ===== */}
        <path
          d="M 70 100 C 55 95, 40 110, 42 130
             C 44 150, 55 165, 75 168
             C 95 171, 110 165, 115 150
             C 118 140, 115 120, 105 108"
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ===== TAIL — playful upward curl ===== */}
        <path
          d="M 42 130 C 30 125, 18 130, 15 120
             C 12 110, 18 100, 28 102"
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeLinecap="round"
          className={state === "happy" ? "animate-tail-wag" : ""}
        />

        {/* ===== BACK SPIKES — soft, rounded triangles ===== */}
        <path d="M 68 100 C 63 88, 58 80, 65 96" fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" />
        <path d="M 78 96 C 75 82, 72 72, 80 92" fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" />
        <path d="M 90 95 C 88 82, 86 75, 94 92" fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" />

        {/* ===== HEAD — large, round, dominant ===== */}
        <path
          d="M 105 108 C 108 95, 115 80, 130 72
             C 145 64, 165 65, 175 75
             C 185 85, 182 100, 172 108"
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ===== SNOUT — extends from head, forms upper jaw ===== */}
        <path
          d="M 172 108 C 180 105, 188 98, 190 90
             C 191 85, 188 80, 182 80"
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeLinecap="round"
        />

        {/* ===== NOSTRIL — tiny dot ===== */}
        <circle cx="186" cy="85" r="1.5" fill={stroke} />

        {/* ===== UPPER JAW LINE — connects to mouth area ===== */}
        <path
          d="M 172 108 L 130 110"
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeLinecap="round"
        />

        {/* ===== LOWER JAW — animated ===== */}
        <path
          d={
            state === "chewing"
              ? "M 130 110 C 145 114, 160 114, 172 110"  // closed
              : state === "happy"
                ? "M 130 110 C 142 120, 158 120, 172 110" // gentle smile
                : "M 130 110 C 145 128, 162 126, 172 112" // wide open
          }
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={state === "chewing" ? "animate-jaw" : ""}
        />

        {/* ===== TEETH — small, cute, only when mouth open ===== */}
        {state === "idle" && (
          <g opacity="0.7">
            <line x1="142" y1="110" x2="143" y2="115" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="150" y1="110" x2="151" y2="116" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="158" y1="110" x2="159" y2="115" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* ===== EYE — large, expressive, the soul of the dino ===== */}
        {state === "happy" ? (
          /* Happy: curved arc eye (^‿^) */
          <path
            d="M 140 82 C 146 74, 156 74, 162 82"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap="round"
          />
        ) : (
          /* Normal: big round eye with highlight */
          <g>
            <circle cx="150" cy="82" r="10" fill="none" stroke={stroke} strokeWidth={w} />
            <circle cx="152" cy="80" r="4.5" fill={stroke} />
            <circle cx="149" cy="77" r="2" fill="white" />
          </g>
        )}

        {/* ===== TINY ARMS — adorable T-rex arms ===== */}
        <path
          d="M 108 118 C 115 114, 120 116, 122 122"
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeLinecap="round"
          className={state === "chewing" ? "animate-arm-grab" : ""}
        />
        {/* Tiny hand */}
        <path
          d="M 122 122 L 120 125 M 122 122 L 124 125"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* ===== LEGS — short and sturdy ===== */}
        <path
          d="M 62 160 C 60 170, 55 178, 50 180 L 46 180 M 50 180 L 48 183"
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 90 164 C 92 174, 95 180, 100 182 L 104 182 M 100 182 L 102 185"
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ===== BELLY — single expressive line ===== */}
        <path
          d="M 60 125 C 68 142, 85 148, 100 140"
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* ===== HAPPY STATE DECORATIONS ===== */}
        {state === "happy" && (
          <>
            {/* Sparkle stars */}
            <g className="animate-sparkle">
              <line x1="130" y1="60" x2="130" y2="50" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <line x1="125" y1="55" x2="135" y2="55" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g className="animate-sparkle-delay">
              <line x1="178" y1="65" x2="178" y2="57" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="174" y1="61" x2="182" y2="61" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            {/* Blush */}
            <ellipse cx="165" cy="95" rx="6" ry="3" fill="#fca5a5" opacity="0.4" />
          </>
        )}

        {/* ===== CHEWING STATE DECORATIONS ===== */}
        {state === "chewing" && (
          /* Food crumbs flying */
          <g>
            <circle cx="178" cy="118" r="1.5" fill={stroke} className="animate-particle-1" opacity="0.6" />
            <circle cx="182" cy="114" r="1" fill={stroke} className="animate-particle-2" opacity="0.6" />
            <circle cx="176" cy="122" r="1" fill={stroke} className="animate-particle-3" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
}
