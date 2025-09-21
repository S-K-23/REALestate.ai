import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle recording new interactions
    if (body.userId && body.propertyId && body.interactionType) {
      const { userId, propertyId, interactionType } = body
      
      console.log('📝 Recording interaction:', { userId, propertyId, interactionType })
      
      // Use service role client to bypass RLS
      const serverClient = createServerClient()
      
      // Record the interaction
      const { error: interactionError } = await serverClient
        .from('interaction')
        .insert({
          user_id: userId,
          property_id: propertyId,
          interaction_type: interactionType,
          created_at: new Date().toISOString()
        })
      
      if (interactionError) {
        console.error('Error recording interaction:', interactionError)
        throw interactionError
      }
      
      console.log('✅ Interaction recorded successfully')
      
      // Update user embedding based on interaction
      if (interactionType === 'like' || interactionType === 'superlike') {
        await updateUserEmbedding(userId, serverClient)
      }
      
      const response = NextResponse.json({ success: true })
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }
    
    // Handle getting user interactions (original functionality)
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const serverClient = createServerClient()
    
    const { data, error } = await serverClient
      .from('interaction')
      .select(`
        property_id,
        interaction_type,
        created_at
      `)
      .eq('user_id', userId)

    if (error) throw error

    // Get property details for each interaction
    if (data && data.length > 0) {
      const propertyIds = data.map(interaction => interaction.property_id)
      const { data: properties, error: propertiesError } = await serverClient
        .from('property')
        .select('*')
        .in('id', propertyIds)

      if (propertiesError) throw propertiesError

      // Combine interactions with property data
      const interactions = data.map(interaction => ({
        ...interaction,
        property: properties?.find(p => p.id === interaction.property_id)
      }))

      const response = NextResponse.json({ interactions })
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    const response = NextResponse.json({ interactions: [] })
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  } catch (error: any) {
    console.error('Error in user interactions API:', error)
    const response = NextResponse.json({ error: error.message }, { status: 500 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }
}

async function updateUserEmbedding(userId: string, serverClient: any) {
  try {
    console.log('🧠 Updating user embedding for user:', userId)
    
    // Get user's liked properties
    const { data: likedInteractions, error: likedError } = await serverClient
      .from('interaction')
      .select('property_id')
      .eq('user_id', userId)
      .in('interaction_type', ['like', 'superlike'])
    
    if (likedError) {
      console.error('Error getting liked interactions:', likedError)
      return
    }
    
    if (!likedInteractions || likedInteractions.length === 0) {
      console.log('No liked properties found for user')
      return
    }
    
    const propertyIds = likedInteractions.map(i => i.property_id)
    
    // Get property embeddings for liked properties
    const { data: properties, error: propertiesError } = await serverClient
      .from('property')
      .select('property_embedding')
      .in('id', propertyIds)
      .not('property_embedding', 'is', null)
    
    if (propertiesError) {
      console.error('Error getting property embeddings:', propertiesError)
      return
    }
    
    if (!properties || properties.length === 0) {
      console.log('No property embeddings found')
      return
    }
    
    // Calculate weighted average embedding (recent interactions weighted more)
    const embeddings = properties.map(p => {
      try {
        return JSON.parse(p.property_embedding)
      } catch {
        return null
      }
    }).filter(e => e !== null)
    
    if (embeddings.length === 0) {
      console.log('No valid embeddings found')
      return
    }
    
    // Get user's current embedding for incremental update
    const { data: currentUser, error: userError } = await serverClient
      .from('app_user')
      .select('user_embedding')
      .eq('id', userId)
      .single()
    
    let baseEmbedding = null
    if (currentUser?.user_embedding) {
      try {
        baseEmbedding = JSON.parse(currentUser.user_embedding)
      } catch {
        console.log('Could not parse current user embedding, using fresh calculation')
      }
    }
    
    // Calculate weighted average embedding
    const embeddingSize = embeddings[0].length
    const avgEmbedding = new Array(embeddingSize).fill(0)
    
    // If user has existing embedding, use weighted combination (70% old, 30% new)
    if (baseEmbedding && Array.isArray(baseEmbedding)) {
      for (let i = 0; i < embeddingSize; i++) {
        avgEmbedding[i] = baseEmbedding[i] * 0.7
      }
    }
    
    // Add new embeddings with weight
    const newWeight = baseEmbedding ? 0.3 : 1.0
    const weightPerEmbedding = newWeight / embeddings.length
    
    for (const embedding of embeddings) {
      for (let i = 0; i < embeddingSize; i++) {
        avgEmbedding[i] += embedding[i] * weightPerEmbedding
      }
    }
    
    // Update user embedding
    const { error: updateError } = await serverClient
      .from('app_user')
      .update({
        user_embedding: JSON.stringify(avgEmbedding),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (updateError) {
      console.error('Error updating user embedding:', updateError)
    } else {
      console.log('✅ User embedding updated successfully')
    }
    
  } catch (error) {
    console.error('Error updating user embedding:', error)
  }
}
