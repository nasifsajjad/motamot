import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function isAdmin(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return data?.is_admin === true;
}

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: reports } = await supabase
    .from("reports")
    .select(`
      id, target_type, target_id, reason, created_at, resolved,
      users!reporter_user_id (id, display_name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: flaggedPosts } = await supabase
    .from("posts")
    .select("id, slug, title, net_votes, published, created_at")
    .lt("net_votes", -5)
    .order("net_votes", { ascending: true })
    .limit(20);

  return NextResponse.json({ reports: reports ?? [], flaggedPosts: flaggedPosts ?? [] });
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { postId, action } = await req.json() as { postId: string; action: "unpublish" | "delete" | "approve" };

  if (action === "delete") {
    await supabase.from("posts").delete().eq("id", postId);
  } else if (action === "unpublish") {
    await supabase.from("posts").update({ published: false }).eq("id", postId);
  } else if (action === "approve") {
    await supabase.from("posts").update({ published: true }).eq("id", postId);
  }

  return NextResponse.json({ success: true });
}
