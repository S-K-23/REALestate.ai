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
    
    // Get user's liked properties
    const { data: interactions, error: interactionsError } = await serverClient
      .from('interaction')
      .select('property_id')
      .eq('user_id', userId)
      .eq('interaction_type', 'like')

    if (interactionsError) throw interactionsError

    if (!interactions || interactions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No liked properties to update embedding' 
      })
    }

    // Get property embeddings for liked properties
    const propertyIds = interactions.map(i => i.property_id)
    const { data: properties, error: propertiesError } = await serverClient
      .from('property')
      .select('property_embedding')
      .in('id', propertyIds)

    if (propertiesError) throw propertiesError

    const embeddings = properties
      ?.map(p => p.property_embedding)
      .filter(Boolean) || []

    if (embeddings.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No valid embeddings found' 
      })
    }

    const avgEmbedding = embeddings.reduce((acc, embedding) => {
      return acc.map((val, i) => val + embedding[i])
    }, new Array(embeddings[0].length).fill(0))
      .map(val => val / embeddings.length)

    // Update user's embedding
    await serverClient
      .from('app_user')
      .update({ user_embedding: avgEmbedding })
      .eq('id', userId)

    return NextResponse.json({ 
      success: true, 
      message: 'User preferences updated successfully' 
    })

  } catch (error: any) {
    console.error('API Error updating user preferences:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
