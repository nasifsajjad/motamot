import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rl = rateLimit(req, { windowMs: 60_000, max: 60 });
  if (!rl.allowed) return rateLimitResponse();

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vote } = await req.json() as { vote: 1 | -1 | 0 };

  if (vote !== 1 && vote !== -1 && vote !== 0) {
    return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
  }

  const postId = params.id;

  // Check post exists and not author's own post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, author_id")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.author_id === user.id) {
    return NextResponse.json(
      { error: "You cannot vote on your own post." },
      { status: 403 }
    );
  }

  // Fetch existing vote
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id, vote")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (vote === 0) {
    // Remove vote
    if (existingVote) {
      await supabase.from("votes").delete().eq("id", existingVote.id);
      // Update denormalized counts
      await updateVoteCounts(supabase, postId, existingVote.vote as 1 | -1, "remove");
    }
  } else if (existingVote) {
    if (existingVote.vote === vote) {
      // Already voted this way — remove (toggle)
      await supabase.from("votes").delete().eq("id", existingVote.id);
      await updateVoteCounts(supabase, postId, vote, "remove");
    } else {
      // Change vote direction
      await supabase
        .from("votes")
        .update({ vote })
        .eq("id", existingVote.id);
      await updateVoteCounts(supabase, postId, existingVote.vote as 1 | -1, "remove");
      await updateVoteCounts(supabase, postId, vote, "add");
    }
  } else {
    // New vote
    await supabase.from("votes").insert({
      post_id: postId,
      user_id: user.id,
      vote,
    });
    await updateVoteCounts(supabase, postId, vote, "add");
  }

  // Return updated counts
  const { data: updatedPost } = await supabase
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
