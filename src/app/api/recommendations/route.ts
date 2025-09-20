import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, limit = 20 } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get property recommendations using the database function
    const { data, error } = await supabase
      .rpc('get_property_recommendations', {
        p_user_id: userId,
        p_limit: limit
      })

    if (error) {
      console.error('Error getting recommendations, falling back to regular properties:', error)
      // Fallback to regular properties instead of returning error
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('property')
        .select('*')
        .limit(limit)
        .order('created_at', { ascending: false })

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        recommendations: fallbackData?.map((property: any) => ({
          ...property,
          similarity_score: 0,
          reason: 'fallback'
        })) || []
      })
    }

    // Get full property data for the recommendations
    const propertyIds = data?.map((rec: any) => rec.property_id) || []
    
    if (propertyIds.length === 0) {
      // Fallback to regular property query if no recommendations
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('property')
        .select('*')
        .limit(limit)
        .order('created_at', { ascending: false })

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        recommendations: fallbackData?.map((property: any) => ({
          ...property,
          similarity_score: 0,
          reason: 'fallback'
        })) || []
      })
    }

    const { data: properties, error: propertiesError } = await supabase
      .from('property')
      .select('*')
      .in('id', propertyIds)

    if (propertiesError) {
      return NextResponse.json({ error: propertiesError.message }, { status: 500 })
    }

    // Combine properties with recommendation scores
    const recommendations = propertyIds
      .map((propertyId: string) => {
        const property = properties?.find(p => p.id === propertyId)
        const recommendation = data?.find((r: any) => r.property_id === propertyId)
        
        return property ? {
          ...property,
          similarity_score: recommendation?.similarity_score || 0,
          reason: recommendation?.reason || 'unknown'
        } : null
      })
      .filter(Boolean)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error in recommendations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
