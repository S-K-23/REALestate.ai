import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, propertyId, interactionType } = await request.json()

    if (!userId || !propertyId || !interactionType) {
      return NextResponse.json({ 
        error: 'User ID, property ID, and interaction type are required' 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const serverClient = createServerClient()
    
    // First, ensure the user exists in app_user table
    await serverClient
      .from('app_user')
      .upsert({
        id: userId,
        email: 'demo@realagent.com',
        display_name: 'Demo User',
        created_at: new Date().toISOString()
      })

    // Check if interaction already exists
    const { data: existingInteraction, error: checkError } = await serverClient
      .from('interaction')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected for new interactions
      throw checkError
    }

    // Only insert if interaction doesn't exist
    if (!existingInteraction) {
      const { error } = await serverClient
        .from('interaction')
        .insert({
          user_id: userId,
          property_id: propertyId,
          interaction_type: interactionType,
          created_at: new Date().toISOString()
        })

      if (error) throw error
    } else {
      console.log(`Interaction already exists for user ${userId} and property ${propertyId}`)
    }

    // Update user embedding based on new interaction
    if (interactionType === 'like' || interactionType === 'superlike') {
      await updateUserEmbedding(userId, serverClient)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error recording interaction:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

async function updateUserEmbedding(userId: string, serverClient: any) {
  try {
    // Get user's liked properties
    const { data: interactions, error: interactionsError } = await serverClient
      .from('interaction')
      .select('property_id')
      .eq('user_id', userId)
      .eq('interaction_type', 'like')

    if (interactionsError) throw interactionsError

    if (!interactions || interactions.length === 0) return

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

    if (embeddings.length === 0) return

    const avgEmbedding = embeddings.reduce((acc, embedding) => {
      return acc.map((val, i) => val + embedding[i])
    }, new Array(embeddings[0].length).fill(0))
      .map(val => val / embeddings.length)

    // Update user's embedding
    await serverClient
      .from('app_user')
      .update({ user_embedding: avgEmbedding })
      .eq('id', userId)

  } catch (error) {
    console.error('Error updating user embedding:', error)
  }
}
