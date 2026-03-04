import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PostPageClient } from "./PostPageClient";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, language, users!author_id(display_name)")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Post not found" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://motamot.vercel.app";

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `${baseUrl}/posts/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: { canonical: `${baseUrl}/posts/${params.slug}` },
  };
}

export default async function PostPage({ params }: Props) {
  const supabase = createServerSupabaseClient();
  const { data: post } = await supabase
    .from("posts")
    .select(`
      id, slug, title, body, excerpt, language, type,
      created_at, updated_at, published,
      net_votes, upvotes_count, downvotes_count,
      users!author_id (id, display_name, avatar_url)
    `)
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  const normalised = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    body: post.body,
    excerpt: post.excerpt,
    language: post.language,
    type: post.type,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    published: post.published,
    netVotes: post.net_votes,
    upvotesCount: post.upvotes_count,
    downvotesCount: post.downvotes_count,
    author: post.users,
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://motamot.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    inLanguage: post.language === "bn" ? "bn" : "en",
    datePublished: post.created_at,
    dateModified: post.updated_at,
    url: `${baseUrl}/posts/${post.slug}`,
    author: {
      "@type": "Person",
      name: (post.users as unknown as Record<string,unknown>)?.display_name ?? "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "Motamot",
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostPageClient post={normalised} />
    </>
  );
}