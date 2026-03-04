import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert user profile
      await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email,
        display_name:
          data.user.user_metadata?.full_name ??
          data.user.user_metadata?.name ??
          data.user.email?.split("@")[0] ??
          "User",
        avatar_url:
          data.user.user_metadata?.avatar_url ??
          data.user.user_metadata?.picture ??
          null,
        provider: data.user.app_metadata?.provider ?? "oauth",
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
