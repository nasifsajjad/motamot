// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { containsProfanity } from '@/lib/profanityFilter';
import slugify from 'slugify';

/**
 * Handles the POST request to create a new post.
 *
 * This function performs the following steps:
 * 1. Checks for user authentication using Supabase auth helpers.
 * 2. Extracts and validates the post data from the request body.
 * 3. Runs a server-side profanity filter on the title and body.
 * 4. Generates a unique and SEO-friendly slug.
 * 5. Creates an excerpt from the post body.
 * 6. Inserts the new post into the Supabase database.
 * 7. Returns a JSON response with the new post's slug or an error message.
 */
export async function POST(request: Request) {
  // Initialize the Supabase client with the request's cookies for session management.
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Step 1: Check for authentication. If no active session, return a 401 error.
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { title, body, language, type } = await request.json();

  // Step 2: Validate that all required fields are present.
  if (!title || !body || !language || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Step 3: Run the server-side profanity filter.
  if (containsProfanity(title) || containsProfanity(body)) {
    return NextResponse.json({ 
      error: 'Your post contains disallowed language and cannot be published.' 
    }, { status: 403 });
  }

  // Step 4: Generate a unique, SEO-friendly slug from the title.
  const baseSlug = slugify(title, { lower: true, strict: true });
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
  
  // Step 5: Create a short excerpt from the main body text.
  const excerpt = body.substring(0, 150) + (body.length > 150 ? '...' : '');

  // Step 6: Insert the new post into the 'posts' table.
  // We use the authenticated user's ID for the `author_id` field.
  const { data: newPost, error } = await supabase
    .from('posts')
    .insert([
      {
        slug,
        title,
        body,
        excerpt,
        language,
        type,
        author_id: session.user.id,
      },
    ])
    .select('slug') // Select only the slug for the response, as that's all we need.
    .single();

  // Handle any database errors.
  if (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }

  // Step 7: Return a successful response with the new post's slug.
  return NextResponse.json({ slug: newPost.slug }, { status: 201 });
}