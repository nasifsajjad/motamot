// app/api/posts/[id]/vote/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // 1. Check for authentication
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = params;
  const { vote } = await request.json(); // vote will be 1 for upvote, -1 for downvote

  if (vote !== 1 && vote !== -1) {
    return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 });
  }

  const user = session.user;

  // 2. Prevent users from voting on their own posts
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  if (post.author_id === user.id) {
    return NextResponse.json({ error: 'You cannot vote on your own post' }, { status: 403 });
  }

  try {
    // 3. Check for an existing vote from this user
    const { data: existingVote, error: voteFetchError } = await supabase
      .from('votes')
      .select('vote')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single();
    
    // Calculate vote change
    let voteChange = 0;
    if (existingVote) {
      if (existingVote.vote === vote) {
        // User is clicking the same vote button, so remove the vote
        await supabase.from('votes').delete().eq('post_id', id).eq('user_id', user.id);
        voteChange = -vote;
      } else {
        // User is changing their vote (e.g., from upvote to downvote)
        await supabase.from('votes').update({ vote }).eq('post_id', id).eq('user_id', user.id);
        voteChange = vote - existingVote.vote;
      }
    } else {
      // User is casting a new vote
      await supabase.from('votes').insert([{ post_id: id, user_id: user.id, vote }]);
      voteChange = vote;
    }

    // 4. Update the net_votes on the post table
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({ net_votes: post.net_votes + voteChange })
      .eq('id', id)
      .select('net_votes')
      .single();

    if (updateError) {
      console.error('Error updating post votes:', updateError);
      return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
    }

    return NextResponse.json({ netVotes: updatedPost.net_votes });

  } catch (error) {
    console.error('Error in vote API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}