// app/api/posts/[id]/comments/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { containsProfanity } from '@/lib/profanityFilter';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Check for authentication
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = params;
  const { body } = await request.json();

  if (!body) {
    return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
  }

  // Check for profanity in the comment body
  if (containsProfanity(body)) {
    return NextResponse.json({ 
      error: 'Your comment contains disallowed language and cannot be published.' 
    }, { status: 403 });
  }

  try {
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert([
        { 
          post_id: id, 
          author_id: session.user.id, 
          body: body,
          // Language is optional for comments; we can assume it's the same as the post or let the user select
          language: 'en' // Or get from request body
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Comment posted successfully', comment: newComment }, { status: 201 });

  } catch (error) {
    console.error('Error in comment API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}