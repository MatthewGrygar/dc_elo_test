import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export function formatPercent(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

// Avatar initials: first letter of first word + first letter of last word
// If name starts with emoji, return the emoji
// e.g. "Miroslav Kalina" → "MK", "Marek Majer" → "MM", "🧙‍♂️ Jenda" → "🧙‍♂️"
export function avatarInitials(name: string): string {
  if (!name) return "?";
  const trimmed = name.trim();

  // Check if starts with emoji (unicode emoji range)
  const emojiMatch = trimmed.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}[\p{Emoji_Modifier}]?(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*)/u);
  if (emojiMatch) {
    return emojiMatch[0];
  }

  // Split into words, take first and last
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();

  const first = words[0][0].toUpperCase();
  const last = words[words.length - 1][0].toUpperCase();
  return first + last;
}
