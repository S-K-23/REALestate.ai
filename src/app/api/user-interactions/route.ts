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
    
    const { data, error } = await serverClient
      .from('interaction')
      .select(`
        property_id,
        interaction_type
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

      return NextResponse.json({ interactions })
    }

    return NextResponse.json({ interactions: [] })
  } catch (error: any) {
    console.error('Error getting user interactions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
