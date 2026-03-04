import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rl = rateLimit(req, { windowMs: 60_000, max: 60 });
  if (!rl.allowed) return rateLimitResponse();

  // Try Bearer token first (sent by client), fall back to cookie-based auth
  const authHeader = req.headers.get("authorization");
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    // Verify token with Supabase admin client (no cookies needed)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) userId = user.id;
  }

  // Fall back to cookie-based auth
  if (!userId) {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vote } = await req.json() as { vote: 1 | -1 | 0 };

  if (vote !== 1 && vote !== -1 && vote !== 0) {
    return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
  }

  const postId = params.id;

  // Use admin client for DB operations (bypasses RLS issues)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check post exists and not author's own post
  const { data: post, error: postError } = await supabaseAdmin
    .from("posts")
    .select("id, author_id")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.author_id === userId) {
    return NextResponse.json(
      { error: "You cannot vote on your own post." },
      { status: 403 }
    );
  }

  // Fetch existing vote
  const { data: existingVote } = await supabaseAdmin
    .from("votes")
    .select("id, vote")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (vote === 0) {
    if (existingVote) {
      await supabaseAdmin.from("votes").delete().eq("id", existingVote.id);
      await updateVoteCounts(supabaseAdmin, postId, existingVote.vote as 1 | -1, "remove");
    }
  } else if (existingVote) {
    if (existingVote.vote === vote) {
      await supabaseAdmin.from("votes").delete().eq("id", existingVote.id);
      await updateVoteCounts(supabaseAdmin, postId, vote, "remove");
    } else {
      await supabaseAdmin.from("votes").update({ vote }).eq("id", existingVote.id);
      await updateVoteCounts(supabaseAdmin, postId, existingVote.vote as 1 | -1, "remove");
      await updateVoteCounts(supabaseAdmin, postId, vote, "add");
    }
  } else {
    await supabaseAdmin.from("votes").insert({
      post_id: postId,
      user_id: userId,
      vote,
    });
    await updateVoteCounts(supabaseAdmin, postId, vote, "add");
  }

  const { data: updatedPost } = await supabaseAdmin
    .from("posts")
    .select("net_votes, upvotes_count, downvotes_count")
    .eq("id", postId)
    .single();

  return NextResponse.json({ success: true, ...(updatedPost ?? {}) });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateVoteCounts(supabase: any, postId: string, vote: 1 | -1, action: "add" | "remove") {
  const delta = action === "add" ? 1 : -1;
  const { data: post } = await supabase
    .from("posts")
    .select("net_votes, upvotes_count, downvotes_count")
    .eq("id", postId)
    .single();

  if (!post) return;

  const upvotesDelta = vote === 1 ? delta : 0;
  const downvotesDelta = vote === -1 ? delta : 0;

  await supabase
    .from("posts")
    .update({
      net_votes: (post.net_votes ?? 0) + vote * delta,
      upvotes_count: Math.max(0, (post.upvotes_count ?? 0) + upvotesDelta),
      downvotes_count: Math.max(0, (post.downvotes_count ?? 0) + downvotesDelta),
    })
    .eq("id", postId);
}