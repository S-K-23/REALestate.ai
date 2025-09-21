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
    const filters = await request.json()
    console.log('🔍 Applying filters:', filters)

    const serverClient = createServerClient()
    
    if (!serverClient) {
      return NextResponse.json({ error: 'Failed to create server client' }, { status: 500 })
    }

    // Build the query based on filters
    let query = serverClient.from('property').select('*')

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      if (filters.minPrice && filters.maxPrice) {
        query = query.gte('price', filters.minPrice).lte('price', filters.maxPrice)
      } else if (filters.minPrice) {
        query = query.gte('price', filters.minPrice)
      } else if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }
    }

    // Square footage filter
    if (filters.minSqft || filters.maxSqft) {
      if (filters.minSqft && filters.maxSqft) {
        query = query.gte('square_feet', filters.minSqft).lte('square_feet', filters.maxSqft)
      } else if (filters.minSqft) {
        query = query.gte('square_feet', filters.minSqft)
      } else if (filters.maxSqft) {
        query = query.lte('square_feet', filters.maxSqft)
      }
    }

    // Bedrooms filter
    if (filters.minBedrooms || filters.maxBedrooms) {
      if (filters.minBedrooms && filters.maxBedrooms) {
        query = query.gte('bedrooms', filters.minBedrooms).lte('bedrooms', filters.maxBedrooms)
      } else if (filters.minBedrooms) {
        query = query.gte('bedrooms', filters.minBedrooms)
      } else if (filters.maxBedrooms) {
        query = query.lte('bedrooms', filters.maxBedrooms)
      }
    }

    // Bathrooms filter
    if (filters.minBathrooms || filters.maxBathrooms) {
      if (filters.minBathrooms && filters.maxBathrooms) {
        query = query.gte('bathrooms', filters.minBathrooms).lte('bathrooms', filters.maxBathrooms)
      } else if (filters.minBathrooms) {
        query = query.gte('bathrooms', filters.minBathrooms)
      } else if (filters.maxBathrooms) {
        query = query.lte('bathrooms', filters.maxBathrooms)
      }
    }

    // Location filters
    if (filters.states && filters.states.length > 0) {
      query = query.in('state', filters.states)
    }

    if (filters.cities && filters.cities.length > 0) {
      query = query.in('city', filters.cities)
    }

    // Property type filter
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      query = query.in('property_type', filters.propertyTypes)
    }

    // Year built filter
    if (filters.minYear || filters.maxYear) {
      if (filters.minYear && filters.maxYear) {
        query = query.gte('year_built', filters.minYear).lte('year_built', filters.maxYear)
      } else if (filters.minYear) {
        query = query.gte('year_built', filters.minYear)
      } else if (filters.maxYear) {
        query = query.lte('year_built', filters.maxYear)
      }
    }

    // Lot size filter
    if (filters.minLotSize || filters.maxLotSize) {
      if (filters.minLotSize && filters.maxLotSize) {
        query = query.gte('lot_size', filters.minLotSize).lte('lot_size', filters.maxLotSize)
      } else if (filters.minLotSize) {
        query = query.gte('lot_size', filters.minLotSize)
      } else if (filters.maxLotSize) {
        query = query.lte('lot_size', filters.maxLotSize)
      }
    }

    // Add pagination
    const limit = filters.limit || 50
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)

    // Add ordering
    const orderBy = filters.orderBy || 'created_at'
    const orderDirection = filters.orderDirection || 'desc'
    query = query.order(orderBy, { ascending: orderDirection === 'asc' })

    const { data: properties, error } = await query

    if (error) {
      console.error('Error filtering properties:', error)
      return NextResponse.json({ error: 'Failed to filter properties' }, { status: 500 })
    }

    console.log(`🔍 Filtered properties: ${properties?.length || 0} results`)

    // If user ID is provided, update their preferences based on filters
    if (filters.userId) {
      await updateUserPreferencesFromFilters(filters.userId, filters, serverClient)
    }

    const response = NextResponse.json({ 
      properties: properties || [],
      count: properties?.length || 0,
      filters: filters
    })
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response

  } catch (error: any) {
    console.error('Error in filter API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

async function updateUserPreferencesFromFilters(userId: string, filters: any, serverClient: any) {
  try {
    console.log('📝 Updating user preferences based on filters for user:', userId)

    // Get current user preferences
    const { data: userData, error: userError } = await serverClient
      .from('app_user')
      .select('preferences')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error getting user preferences:', userError)
      return
    }

    // Update preferences with filter data
    const currentPreferences = userData?.preferences || {}
    const updatedPreferences = {
      ...currentPreferences,
      filters: {
        priceRange: filters.minPrice || filters.maxPrice ? {
          min: filters.minPrice || 0,
          max: filters.maxPrice || 1000000
        } : undefined,
        squareFeetRange: filters.minSqft || filters.maxSqft ? {
          min: filters.minSqft || 0,
          max: filters.maxSqft || 5000
        } : undefined,
        bedroomsRange: filters.minBedrooms || filters.maxBedrooms ? {
          min: filters.minBedrooms || 0,
          max: filters.maxBedrooms || 10
        } : undefined,
        bathroomsRange: filters.minBathrooms || filters.maxBathrooms ? {
          min: filters.minBathrooms || 0,
          max: filters.maxBathrooms || 10
        } : undefined,
        preferredStates: filters.states || [],
        preferredCities: filters.cities || [],
        preferredPropertyTypes: filters.propertyTypes || [],
        yearBuiltRange: filters.minYear || filters.maxYear ? {
          min: filters.minYear || 1900,
          max: filters.maxYear || new Date().getFullYear()
        } : undefined,
        lotSizeRange: filters.minLotSize || filters.maxLotSize ? {
          min: filters.minLotSize || 0,
          max: filters.maxLotSize || 10
        } : undefined
      },
      lastFilteredAt: new Date().toISOString()
    }

    // Save updated preferences
    const { error: updateError } = await serverClient
      .from('app_user')
      .update({ preferences: updatedPreferences })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user preferences:', updateError)
    } else {
      console.log('✅ Updated user preferences based on filters')
    }

  } catch (error) {
    console.error('Error updating user preferences from filters:', error)
  }
}
