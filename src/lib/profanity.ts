import Filter from "bad-words";

// Extend with custom blacklist (loaded from env / config)
const customBlacklist: string[] = (
  process.env.CUSTOM_BLACKLIST ?? ""
)
  .split(",")
  .map((w) => w.trim())
  .filter(Boolean);

// Bangla vulgar words blacklist (community-maintained config)
const banglaBlacklist: string[] = (
  process.env.BANGLA_BLACKLIST ?? ""
)
  .split(",")
  .map((w) => w.trim())
  .filter(Boolean);

const filter = new Filter();
if (customBlacklist.length) filter.addWords(...customBlacklist);

/**
 * Normalise obfuscated text: l33t speak, repeated chars, zero-width chars
 */
function normalise(text: string): string {
  return text
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, "") // zero-width chars
    .replace(/[*@#$!]/g, "a") // symbol substitutions
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/(.)\1{2,}/g, "$1$1") // de-repeat (e.g. "fuuuuck" → "fuuck")
    .toLowerCase();
}

/**
 * Check if text contains profanity.
 * Returns { clean: boolean, offendingWords: string[] }
 */
export function checkProfanity(text: string): {
  clean: boolean;
  offendingWords: string[];
} {
  const normalised = normalise(text);

  // English filter
  const hasProfanity = filter.isProfane(normalised);

  // Bangla blacklist check
  const banglaHits = banglaBlacklist.filter((word) =>
    normalised.includes(word.toLowerCase())
  );

  const offendingWords: string[] = [];
  if (hasProfanity) {
    // Extract matched words (best effort)
    try {
      const cleaned = filter.clean(normalised);
      const orig = normalised.split(" ");
      const cln = cleaned.split(" ");
      orig.forEach((w, i) => {
        if (cln[i] && cln[i].includes("*")) offendingWords.push(w);
      });
    } catch {}
  }

  return {
    clean: !hasProfanity && banglaHits.length === 0,
    offendingWords: [...offendingWords, ...banglaHits],
  };
}

/**
 * Sanitise text for XSS — strip HTML tags.
 */
export function sanitiseInput(text: string): string {
  return text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}
