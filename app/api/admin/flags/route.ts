// app/api/admin/flags/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Check if the user is authenticated and is the admin
  if (!session || session.user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch flagged posts and comments
  // A 'flagged' item is one that has at least one report entry.
  const { data: flaggedPosts, error: postError } = await supabase
    .from('posts')
    .select('*, reports(count)')
    .not('reports.count', 'is', null) // Only select posts that have at least one report
    .order('created_at', { ascending: false });

  if (postError) {
    console.error('Error fetching flagged posts:', postError);
    return NextResponse.json({ error: 'Failed to fetch flagged posts' }, { status: 500 });
  }

  const { data: flaggedComments, error: commentError } = await supabase
    .from('comments')
    .select('*, reports(count)')
    .not('reports.count', 'is', null) // Only select comments that have at least one report
    .order('created_at', { ascending: false });

  if (commentError) {
    console.error('Error fetching flagged comments:', commentError);
    return NextResponse.json({ error: 'Failed to fetch flagged comments' }, { status: 500 });
  }

  return NextResponse.json({
    posts: flaggedPosts,
    comments: flaggedComments,
  });
}

// We'll also need a POST endpoint for users to report content
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { targetType, targetId, reason } = await request.json();

  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'Missing target type or ID' }, { status: 400 });
  }

  const { error } = await supabase.from('reports').insert({
    target_type: targetType,
    target_id: targetId,
    reporter_user_id: session.user.id,
    reason: reason || 'No reason provided',
  });

  if (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Report submitted successfully' }, { status: 201 });
}