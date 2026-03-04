import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PostMode } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = (searchParams.get("mode") ?? "all") as PostMode;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";
  const lang = searchParams.get("lang") ?? "";

  const offset = (page - 1) * limit;
  const supabase = createServerSupabaseClient();

  try {
    let query = supabase
      .from("posts")
      .select(
        `
        id, slug, title, excerpt, language, type, created_at, updated_at,
        net_votes, upvotes_count, downvotes_count, published,
        users!author_id (id, display_name, avatar_url)
      `,
        { count: "exact" }
      )
      .eq("published", true);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (lang) {
      query = query.eq("language", lang);
    }

    if (mode === "featured") {
      query = query.order("net_votes", { ascending: false });
    } else if (mode === "hot") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query
        .gte("created_at", today.toISOString())
        .order("net_votes", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    const posts = (data ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      language: p.language,
      type: p.type,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      netVotes: p.net_votes,
      upvotesCount: p.upvotes_count,
      downvotesCount: p.downvotes_count,
      published: p.published,
      author: Array.isArray(p.users)
        ? p.users[0] ?? null
        : p.users ?? null,
    }));

    return NextResponse.json({
      posts,
      hasMore: (count ?? 0) > offset + limit,
      total: count ?? 0,
    });
  } catch (err) {
    console.error("[GET /api/posts]", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}