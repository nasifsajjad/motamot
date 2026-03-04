import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkProfanity, sanitiseInput } from "@/lib/profanity";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id, body, language, created_at, parent_comment_id,
      users!author_id (id, display_name, avatar_url)
    `)
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }

  // Build threaded structure
  const roots: unknown[] = [];
  const map = new Map<string, Record<string, unknown>>();

  (data ?? []).forEach((c: Record<string, unknown>) => {
    const comment = {
      id: c.id,
      body: c.body,
      language: c.language,
      createdAt: c.created_at,
      parentCommentId: c.parent_comment_id,
      author: c.users,
      replies: [],
    };
    map.set(c.id as string, comment);
  });

  map.forEach((comment) => {
    if (comment.parentCommentId) {
      const parent = map.get(comment.parentCommentId as string);
      if (parent) (parent.replies as unknown[]).push(comment);
    } else {
      roots.push(comment);
    }
  });

  return NextResponse.json({ comments: roots });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rl = rateLimit(req, { windowMs: 60_000, max: 20 });
  if (!rl.allowed) return rateLimitResponse();

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { body, language, parentCommentId } = await req.json();
  const sanitised = sanitiseInput(body ?? "");

  if (!sanitised) {
    return NextResponse.json({ error: "Comment body required" }, { status: 400 });
  }

  const check = checkProfanity(sanitised);
  if (!check.clean) {
    return NextResponse.json(
      { error: "profanity", message: "Comment contains disallowed language." },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: params.id,
      parent_comment_id: parentCommentId ?? null,
      author_id: user.id,
      body: sanitised,
      language: language === "bn" ? "bn" : "en",
    })
    .select("id, body, language, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
