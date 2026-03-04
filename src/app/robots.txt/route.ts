export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://motamot.vercel.app";
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${baseUrl}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
