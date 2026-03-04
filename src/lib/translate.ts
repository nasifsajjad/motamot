import type { Language } from "@/types";

/**
 * Translate text using Google Cloud Translation API.
 * Requires GOOGLE_TRANSLATE_API_KEY env var.
 */
export async function translateText(
  text: string,
  targetLanguage: Language
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    // Fallback: return a mock for development
    console.warn("GOOGLE_TRANSLATE_API_KEY not set — returning mock translation");
    return `[${targetLanguage.toUpperCase()}] ${text}`;
  }

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      target: targetLanguage === "bn" ? "bn" : "en",
      format: "text",
    }),
  });

  if (!res.ok) {
    throw new Error(`Translation API error: ${res.status}`);
  }

  const data = await res.json();
  return data.data?.translations?.[0]?.translatedText ?? text;
}
