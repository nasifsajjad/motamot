import slugify from "slugify";
import { nanoid } from "nanoid";

export function generateSlug(title: string): string {
  const base = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
    replacement: "-",
  });
  // Append short unique id to guarantee uniqueness
  const uid = nanoid(6);
  return base ? `${base}-${uid}` : uid;
}

export function generateExcerpt(body: string, maxLength = 200): string {
  const plain = body.replace(/#+\s/g, "").replace(/\n+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}
