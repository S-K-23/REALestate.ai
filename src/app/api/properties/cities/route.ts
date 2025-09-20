import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { states } = await request.json()

    if (!states || !Array.isArray(states) || states.length === 0) {
      return NextResponse.json({ cities: [] })
    }

    const serverClient = createServerClient()
    
    if (!serverClient) {
      return NextResponse.json({ error: 'Failed to create server client' }, { status: 500 })
    }

    const { data: cities, error } = await serverClient
      .from('property')
      .select('city')
      .in('state', states)
      .order('city')

    if (error) {
      console.error('Error fetching cities:', error)
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
    }

    // Get unique cities and sort them
    const uniqueCities = [...new Set(cities?.map(item => item.city) || [])].sort()

    return NextResponse.json({ cities: uniqueCities })

  } catch (error: any) {
    console.error('Error in cities API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
