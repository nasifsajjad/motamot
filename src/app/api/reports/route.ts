import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 60_000, max: 5 });
  if (!rl.allowed) return rateLimitResponse();

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetType, targetId, reason } = await req.json();

  if (!["post", "comment"].includes(targetType) || !targetId || !reason) {
    return NextResponse.json({ error: "Invalid report data" }, { status: 400 });
  }

  const { error } = await supabase.from("reports").insert({
    target_type: targetType,
    target_id: targetId,
    reporter_user_id: user.id,
    reason,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
