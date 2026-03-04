import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerSupabaseClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://motamot.vercel.app";

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(1000);

  const staticPages = ["", "/about", "/privacy", "/tos"];

  const staticXml = staticPages
    .map(
      (path) =>
        `<url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    )
    .join("\n");

  const postXml = (posts ?? [])
    .map(
      (p) =>
        `<url><loc>${baseUrl}/posts/${p.slug}</loc><lastmod>${p.updated_at}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${postXml}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
