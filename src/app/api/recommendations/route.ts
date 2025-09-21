import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function POST(request: NextRequest) {
  try {
    const { userId, location, searchRadius = 100, filters = {}, limit = 50 } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🎯 Getting recommendations for user:', userId, 'at location:', location?.name)
    console.log('📍 Location coordinates:', { lat: location?.lat, lng: location?.lng })
    console.log('🔍 Search radius:', searchRadius, 'km')
    console.log('🔍 DEBUG - Filters received by backend:', JSON.stringify(filters, null, 2))

    // Use server client for recommendations
    const serverClient = createServerClient()
    
    if (!serverClient) {
      return NextResponse.json({ error: 'Failed to create server client' }, { status: 500 })
    }

    // Get user's interactions to exclude already seen properties
    const { data: interactions } = await serverClient
      .from('interaction')
      .select('property_id')
      .eq('user_id', userId)
      .in('interaction_type', ['like', 'skip'])

    const seenPropertyIds = interactions?.map(i => i.property_id) || []

    // Check if location is valid, if not use fallback
    if (!location?.lat || !location?.lng || isNaN(location.lat) || isNaN(location.lng)) {
      console.log('⚠️ No valid location provided, using fallback search...')
      
      // FALLBACK: Get random properties that match filters
      let fallbackQuery = serverClient
        .from('property')
        .select('*')

      // Apply filters to fallback search
      if (filters.priceRange) {
        fallbackQuery = fallbackQuery
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1])
      }

      if (filters.bedrooms) {
        fallbackQuery = fallbackQuery
          .gte('bedrooms', filters.bedrooms[0])
          .lte('bedrooms', filters.bedrooms[1])
      }

      if (filters.bathrooms) {
        fallbackQuery = fallbackQuery
          .gte('bathrooms', filters.bathrooms[0])
          .lte('bathrooms', filters.bathrooms[1])
      }

      if (filters.squareFeet) {
        fallbackQuery = fallbackQuery
          .gte('square_feet', filters.squareFeet[0])
          .lte('square_feet', filters.squareFeet[1])
      }

      if (filters.yearBuilt) {
        fallbackQuery = fallbackQuery
          .gte('year_built', filters.yearBuilt[0])
          .lte('year_built', filters.yearBuilt[1])
      }

      if (filters.capRate) {
        fallbackQuery = fallbackQuery.or(`cap_rate.is.null,cap_rate.gte.${filters.capRate[0]},cap_rate.lte.${filters.capRate[1]}`)
      }

      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        fallbackQuery = fallbackQuery.in('property_type', filters.propertyTypes)
      }

      if (filters.states && filters.states.length > 0) {
        fallbackQuery = fallbackQuery.in('state', filters.states)
      }

      // Filter out seen properties
      if (seenPropertyIds.length > 0) {
        fallbackQuery = fallbackQuery.not('id', 'in', `(${seenPropertyIds.join(',')})`)
      }

      // Random ordering for fallback
      fallbackQuery = fallbackQuery.order('created_at', { ascending: false })

      const { data: fallbackProperties, error: fallbackError } = await fallbackQuery

      if (fallbackError) {
        console.error('Error getting fallback properties:', fallbackError)
        const response = NextResponse.json({ recommendations: [] })
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response
      }

      if (fallbackProperties && fallbackProperties.length > 0) {
        console.log(`🎲 Found ${fallbackProperties.length} fallback properties (no location)`)
        
        const fallbackRecommendations = fallbackProperties
          .slice(0, limit)
          .map(property => ({
            ...property,
            title: `${property.bedrooms || 'N/A'} bed ${property.property_type || 'home'}`,
            price: `$${property.price?.toLocaleString() || 'N/A'}`,
            location: `${property.city}, ${property.state}`,
            type: property.property_type || 'Unknown',
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            area: property.square_feet ? `${property.square_feet.toLocaleString()} sq ft` : 'N/A',
            image: property.images && property.images.length > 0 ? property.images[0] : null,
            description: property.description || 'No description available',
            similarity_score: 0.3,
            reason: 'fallback_no_location'
          }))

        console.log(`🎲 Returning ${fallbackRecommendations.length} fallback recommendations (no location)`)
        const response = NextResponse.json({ recommendations: fallbackRecommendations })
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response
      }

      // No fallback properties found
      console.log('❌ No properties found with fallback search')
      const response = NextResponse.json({ recommendations: [] })
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    console.log('🗺️ Location-based search within', searchRadius, 'km radius')

    // Get properties with coordinates and apply filters
    let locationQuery = serverClient
      .from('property')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    // Apply ALL filters
    if (filters.priceRange) {
      locationQuery = locationQuery
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])
    }

    if (filters.bedrooms) {
      locationQuery = locationQuery
        .gte('bedrooms', filters.bedrooms[0])
        .lte('bedrooms', filters.bedrooms[1])
    }

    if (filters.bathrooms) {
      locationQuery = locationQuery
        .gte('bathrooms', filters.bathrooms[0])
        .lte('bathrooms', filters.bathrooms[1])
    }

    if (filters.squareFeet) {
      locationQuery = locationQuery
        .gte('square_feet', filters.squareFeet[0])
        .lte('square_feet', filters.squareFeet[1])
    }

    if (filters.yearBuilt) {
      locationQuery = locationQuery
        .gte('year_built', filters.yearBuilt[0])
        .lte('year_built', filters.yearBuilt[1])
    }

    if (filters.capRate) {
      locationQuery = locationQuery.or(`cap_rate.is.null,cap_rate.gte.${filters.capRate[0]},cap_rate.lte.${filters.capRate[1]}`)
    }

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      locationQuery = locationQuery.in('property_type', filters.propertyTypes)
    }

    if (filters.states && filters.states.length > 0) {
      locationQuery = locationQuery.in('state', filters.states)
    }

    // Filter out seen properties if any
    if (seenPropertyIds.length > 0) {
      locationQuery = locationQuery.not('id', 'in', `(${seenPropertyIds.join(',')})`)
    }

    const { data: locationProperties, error: locationError } = await locationQuery

    if (locationError) {
      console.error('Error getting location-based properties:', locationError)
      const response = NextResponse.json({ recommendations: [] })
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    if (!locationProperties || locationProperties.length === 0) {
      console.log('❌ No properties found matching filters')
      const response = NextResponse.json({ recommendations: [] })
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    console.log(`📍 Found ${locationProperties.length} properties with coordinates`)

    // Calculate distances and filter by radius
    const recommendations = locationProperties
      .map(property => {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          parseFloat(property.latitude),
          parseFloat(property.longitude)
        )

        // Only include properties within the search radius
        if (distance <= searchRadius) {
          return {
            ...property,
            title: `${property.bedrooms || 'N/A'} bed ${property.property_type || 'home'}`,
            price: `$${property.price?.toLocaleString() || 'N/A'}`,
            location: `${property.city}, ${property.state}`,
            type: property.property_type || 'Unknown',
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            area: property.square_feet ? `${property.square_feet.toLocaleString()} sq ft` : 'N/A',
            image: property.images && property.images.length > 0 ? property.images[0] : null,
            description: property.description || 'No description available',
            similarity_score: 1.0 - (distance / searchRadius), // Distance-based score
            distance_km: distance,
            reason: 'location_based'
          }
        }
        return null
      })
      .filter(property => property !== null) // Remove properties outside radius
      .sort((a, b) => a.distance_km - b.distance_km) // Sort by distance

    console.log(`🗺️ Found ${recommendations.length} properties within ${searchRadius}km radius`)
    console.log('📍 Closest property:', recommendations[0] ? {
      id: recommendations[0].id,
      bedrooms: recommendations[0].bedrooms,
      property_type: recommendations[0].property_type,
      distance: recommendations[0].distance_km
    } : 'none')

    // If we have enough location-based recommendations, return them
    if (recommendations.length >= Math.min(limit, 10)) {
      const response = NextResponse.json({ recommendations: recommendations.slice(0, limit) })
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // FALLBACK: Get random properties that match filters if not enough location-based results
    console.log('🎲 Using fallback: random properties with filters...')
    
    let fallbackQuery = serverClient
      .from('property')
      .select('*')

    // Apply filters to fallback search
    if (filters.priceRange) {
      fallbackQuery = fallbackQuery
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])
    }

    if (filters.bedrooms) {
      fallbackQuery = fallbackQuery
        .gte('bedrooms', filters.bedrooms[0])
        .lte('bedrooms', filters.bedrooms[1])
    }

    if (filters.bathrooms) {
      fallbackQuery = fallbackQuery
        .gte('bathrooms', filters.bathrooms[0])
        .lte('bathrooms', filters.bathrooms[1])
    }

    if (filters.squareFeet) {
      fallbackQuery = fallbackQuery
        .gte('square_feet', filters.squareFeet[0])
        .lte('square_feet', filters.squareFeet[1])
    }

    if (filters.yearBuilt) {
      fallbackQuery = fallbackQuery
        .gte('year_built', filters.yearBuilt[0])
        .lte('year_built', filters.yearBuilt[1])
    }

    if (filters.capRate) {
      fallbackQuery = fallbackQuery.or(`cap_rate.is.null,cap_rate.gte.${filters.capRate[0]},cap_rate.lte.${filters.capRate[1]}`)
    }

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      fallbackQuery = fallbackQuery.in('property_type', filters.propertyTypes)
    }

    if (filters.states && filters.states.length > 0) {
      fallbackQuery = fallbackQuery.in('state', filters.states)
    }

    // Filter out seen properties
    if (seenPropertyIds.length > 0) {
      fallbackQuery = fallbackQuery.not('id', 'in', `(${seenPropertyIds.join(',')})`)
    }

    // Random ordering for fallback
    fallbackQuery = fallbackQuery.order('created_at', { ascending: false })

    const { data: fallbackProperties, error: fallbackError } = await fallbackQuery

    if (fallbackError) {
      console.error('Error getting fallback properties:', fallbackError)
    }

    if (fallbackProperties && fallbackProperties.length > 0) {
      console.log(`🎲 Found ${fallbackProperties.length} fallback properties`)
      
      const fallbackRecommendations = fallbackProperties
        .slice(0, limit)
        .map(property => ({
          ...property,
          title: `${property.bedrooms || 'N/A'} bed ${property.property_type || 'home'}`,
          price: `$${property.price?.toLocaleString() || 'N/A'}`,
          location: `${property.city}, ${property.state}`,
          type: property.property_type || 'Unknown',
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.square_feet ? `${property.square_feet.toLocaleString()} sq ft` : 'N/A',
          image: property.images && property.images.length > 0 ? property.images[0] : null,
          description: property.description || 'No description available',
          similarity_score: 0.3,
          reason: 'fallback'
        }))

      console.log(`🎲 Returning ${fallbackRecommendations.length} fallback recommendations`)
      const response = NextResponse.json({ recommendations: fallbackRecommendations })
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // No properties found with any method
    console.log('❌ No properties found matching the criteria')
    const response = NextResponse.json({ recommendations: [] })
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response

  } catch (error: any) {
    console.error('Error in recommendations API:', error)
    const response = NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }
}

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}