"use client";

const BRAND_BY_ID: Record<string, "linkedin" | "indeed"> = {};

// Emoji overrides for seed habits, applied by stable id so they take effect
// on already-stored data without re-seeding.
const EMOJI_BY_ID: Record<string, string> = {
  "h-w1": "🚚",
  "h-wrec": "🤝",
  "h-w5": "🛍️",
  "h-w6": "🔨",
  "h-w7": "🏢",
  "h-he2": "💪",
  "h-he3": "🤸",
  "h-he5": "🥩",
  "h-p2": "📖",
};

export function HabitIcon({
  id,
  emoji,
  size = 22,
  className = "",
}: {
  id?: string;
  emoji: string;
  size?: number;
  className?: string;
}) {
  const resolvedEmoji = (id && EMOJI_BY_ID[id]) || emoji;
  const brand = (id && BRAND_BY_ID[id]) || resolvedEmoji;

  if (brand === "linkedin") {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden
      >
        <rect width="24" height="24" rx="4" fill="#0A66C2" />
        <path
          fill="#fff"
          d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.86V21H9z"
        />
      </svg>
    );
  }

  if (brand === "indeed") {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden
      >
        <rect width="24" height="24" rx="4" fill="#003A9B" />
        <circle cx="12" cy="6.4" r="2.2" fill="#fff" />
        <rect x="10.1" y="9.6" width="3.8" height="9" rx="1.9" fill="#fff" />
      </svg>
    );
  }

  return (
    <span className={className} style={{ fontSize: size * 0.9, lineHeight: 1 }}>
      {resolvedEmoji}
    </span>
  );
}
