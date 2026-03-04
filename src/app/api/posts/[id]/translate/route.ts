import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { translateText } from "@/lib/translate";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import type { Language } from "@/types";

// GET: on-demand translate (not saved)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rl = rateLimit(req, { windowMs: 60_000, max: 30 });
  if (!rl.allowed) return rateLimitResponse();

  const targetLang = (req.nextUrl.searchParams.get("target") ?? "en") as Language;
  const supabase = createServerSupabaseClient();

  // First check if a saved translation already exists
  const { data: saved } = await supabase
    .from("translations")
    .select("text, language, translator_user_id, created_at")
    .eq("post_id", params.id)
    .eq("language", targetLang)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (saved) {
    return NextResponse.json({ text: saved.text, saved: true, translatorUserId: saved.translator_user_id });
  }

  // Auto-translate
  const { data: post } = await supabase
    .from("posts")
    .select("body")
    .eq("id", params.id)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const translated = await translateText(post.body, targetLang);
  return NextResponse.json({ text: translated, saved: false, translatorUserId: null });
}

// POST: save a translation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rl = rateLimit(req, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) return rateLimitResponse();

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, language } = await req.json() as { text: string; language: Language };

  if (!text || !language) {
    return NextResponse.json({ error: "text and language required" }, { status: 400 });
  }

  const { error } = await supabase.from("translations").insert({
    post_id: params.id,
    language,
    text,
    translator_user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to save translation" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
