import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('💖 Getting matches for user:', userId)

    const serverClient = createServerClient()
    
    if (!serverClient) {
      return NextResponse.json({ error: 'Failed to create server client' }, { status: 500 })
    }

    // Get super liked properties for the user
    const { data: interactions, error: interactionsError } = await serverClient
      .from('interaction')
      .select(`
        id,
        created_at,
        property:property_id (
          id,
          mls_number,
          address,
          city,
          state,
          zip_code,
          price,
          bedrooms,
          bathrooms,
          square_feet,
          lot_size,
          property_type,
          year_built,
          description,
          images,
          latitude,
          longitude
        )
      `)
      .eq('user_id', userId)
      .eq('interaction_type', 'superlike')
      .order('created_at', { ascending: false })

    if (interactionsError) {
      console.error('Error fetching matches:', interactionsError)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    // Extract properties from interactions
    const matches = interactions?.map(interaction => ({
      ...interaction.property,
      superliked_at: interaction.created_at,
      interaction_id: interaction.id
    })) || []

    console.log(`💖 Found ${matches.length} matches for user`)

    return NextResponse.json({ 
      matches,
      count: matches.length
    })

  } catch (error: any) {
    console.error('Error in matches API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { interactionId } = await request.json()

    if (!interactionId) {
      return NextResponse.json({ error: 'Interaction ID is required' }, { status: 400 })
    }

    console.log('🗑️ Removing match:', interactionId)

    const serverClient = createServerClient()
    
    if (!serverClient) {
      return NextResponse.json({ error: 'Failed to create server client' }, { status: 500 })
    }

    // Remove the superlike interaction
    const { error } = await serverClient
      .from('interaction')
      .delete()
      .eq('id', interactionId)

    if (error) {
      console.error('Error removing match:', error)
      return NextResponse.json({ error: 'Failed to remove match' }, { status: 500 })
    }

    console.log('✅ Match removed successfully')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error in remove match API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
