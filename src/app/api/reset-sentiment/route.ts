import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const serverClient = createServerClient()

    // 1. Delete all user interactions
    const { data: deletedInteractions, error: deleteError } = await serverClient
      .from('interaction')
      .delete()
      .eq('user_id', userId)
      .select()

    if (deleteError) {
      throw deleteError
    }

    // 2. Reset user embedding to null
    const { error: updateError } = await serverClient
      .from('app_user')
      .update({
        user_embedding: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    // 3. Verify the reset
    const { data: remainingInteractions } = await serverClient
      .from('interaction')
      .select('id')
      .eq('user_id', userId)

    const { data: userData } = await serverClient
      .from('app_user')
      .select('user_embedding')
      .eq('id', userId)

    const deletedCount = deletedInteractions?.length || 0
    const remainingCount = remainingInteractions?.length || 0
    const hasEmbedding = userData?.[0]?.user_embedding !== null

    return NextResponse.json({
      success: true,
      message: 'Sentiment analysis reset successfully',
      details: {
        deletedInteractions: deletedCount,
        remainingInteractions: remainingCount,
        hasEmbedding: hasEmbedding
      }
    })

  } catch (error: any) {
    console.error('Error resetting sentiment analysis:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
