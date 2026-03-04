import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkProfanity, sanitiseInput } from "@/lib/profanity";
import { generateSlug, generateExcerpt } from "@/lib/slug";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Rate limit writes: 10 posts/minute per IP
  const rl = rateLimit(req, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) return rateLimitResponse();

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = sanitiseInput(body.title ?? "");
  const postBody = sanitiseInput(body.body ?? "");
  const language = body.language === "bn" ? "bn" : "en";
  const type = body.type === "sharing" ? "sharing" : "problem";

  if (!title || !postBody) {
    return NextResponse.json(
      { error: "Title and body are required." },
      { status: 400 }
    );
  }

  // Profanity check
  const titleCheck = checkProfanity(title);
  const bodyCheck = checkProfanity(postBody);

  if (!titleCheck.clean || !bodyCheck.clean) {
    return NextResponse.json(
      {
        error: "profanity",
        message:
          language === "bn"
            ? "আপনার পোস্টে নিষিদ্ধ ভাষা আছে, এটি প্রকাশ করা যাবে না।"
            : "Your post contains disallowed language and cannot be published.",
        offendingWords: [
          ...titleCheck.offendingWords,
          ...bodyCheck.offendingWords,
        ],
      },
      { status: 422 }
    );
  }

  const slug = generateSlug(title);
  const excerpt = generateExcerpt(postBody);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title,
      body: postBody,
      excerpt,
      language,
      type,
      author_id: user.id,
      published: true,
      net_votes: 0,
      upvotes_count: 0,
      downvotes_count: 0,
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("[POST /api/posts]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
