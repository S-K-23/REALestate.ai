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
    const { userId, limit = 50, location } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🎯 Getting recommendations for user:', userId, 'at location:', location?.name)
    console.log('📍 Location coordinates:', { lat: location?.lat, lng: location?.lng })

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

    // PRIORITY 1: If location is provided, prioritize location-based selection
    if (location?.lat && location?.lng && !isNaN(location.lat) && !isNaN(location.lng)) {
      console.log('🗺️ Location provided, prioritizing location-based selection')
      console.log('✅ Location coordinates are valid numbers:', { lat: location.lat, lng: location.lng })
      
      // Get properties with coordinates first
      let locationQuery = serverClient
        .from('property')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      // Filter out seen properties if any
      if (seenPropertyIds.length > 0) {
        locationQuery = locationQuery.not('id', 'in', `(${seenPropertyIds.join(',')})`)
      }

      const { data: locationProperties, error: locationError } = await locationQuery

      if (locationError) {
        console.error('Error getting location-based properties:', locationError)
      } else if (locationProperties && locationProperties.length > 0) {
        console.log(`📍 Found ${locationProperties.length} properties with coordinates`)
        
        // Calculate distances and prioritize by proximity
        const recommendations = locationProperties.map(property => {
          const distance = calculateDistance(
            location.lat, 
            location.lng, 
            parseFloat(property.latitude), 
            parseFloat(property.longitude)
          )
          
          // Convert distance to a score (closer = higher score)
          let distanceScore = 1.0;
          if (distance <= 10) {
            distanceScore = 1.0; // Very high priority for properties within 10km
          } else if (distance <= 50) {
            distanceScore = 1.0 - ((distance - 10) / 40) * 0.3; // 0.7 to 1.0
          } else if (distance <= 200) {
            distanceScore = 0.7 - ((distance - 50) / 150) * 0.5; // 0.2 to 0.7
          } else {
            distanceScore = 0.1; // Very low priority for far properties
          }
          
          return {
            ...property,
            similarity_score: distanceScore,
            distance_km: distance,
            reason: 'location_priority'
          }
        })
        .sort((a, b) => {
          // Sort by distance first, then by score
          if (a.distance_km !== b.distance_km) {
            return a.distance_km - b.distance_km;
          }
          return b.similarity_score - a.similarity_score;
        })
        .slice(0, limit)

        console.log(`🗺️ Location-based selection returned ${recommendations.length} recommendations`)
        console.log('📍 Closest property:', recommendations[0] ? {
          id: recommendations[0].id,
          address: recommendations[0].address,
          city: recommendations[0].city,
          distance: recommendations[0].distance_km
        } : 'none')
        
        const response = NextResponse.json({ recommendations })
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response
      }
    }

    // PRIORITY 2: Check if user has an embedding for vector search
    const { data: userData, error: userError } = await serverClient
      .from('app_user')
      .select('user_embedding')
      .eq('id', userId)
      .single()

    console.log('🔍 User data query result:', { userData, userError })

    const userEmbedding = userData?.user_embedding

    if (userEmbedding) {
      console.log('🎯 Using vector search with user embedding')
      
      // Get all properties with embeddings
      let query = serverClient
        .from('property')
        .select('*')
        .not('property_embedding', 'is', null)

      // Filter out seen properties if any
      if (seenPropertyIds.length > 0) {
        query = query.not('id', 'in', `(${seenPropertyIds.join(',')})`)
      }

      const { data: allProperties, error: propertiesError } = await query

      if (propertiesError) {
        console.error('Error getting properties for vector search:', propertiesError)
        // Fallback to graph traversal
      } else if (allProperties && allProperties.length > 0) {
        // Calculate vector similarities
        const recommendations = allProperties.map(property => {
          const similarity = calculateVectorSimilarity(userEmbedding, property.property_embedding)
          return {
            ...property,
            similarity_score: similarity,
            reason: 'vector_similarity'
          }
        })
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, limit)

        console.log(`🎯 Vector search returned ${recommendations.length} recommendations`)
        const response = NextResponse.json({ recommendations })
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response
      }
    }

    // Fallback to graph traversal if no user embedding or vector search failed
    console.log('🔗 Using graph traversal')
    
    try {
      const { data: edges, error: edgesError } = await serverClient
        .from('edge')
        .select('target_property_id, similarity_score')
        .order('similarity_score', { ascending: false })
        .limit(limit * 2)

      if (edgesError) {
        console.error('Error getting graph edges:', edgesError)
        // Fallback to regular properties
      } else if (edges && edges.length > 0) {
        // Get property IDs from edges
        const propertyIds = edges.map(edge => edge.target_property_id)
        
        // Get full property data
        const { data: properties, error: propertiesError } = await serverClient
          .from('property')
          .select('*')
          .in('id', propertyIds)

        if (propertiesError) {
          console.error('Error getting properties for recommendations:', propertiesError)
        } else if (properties) {
          // Filter out seen properties and get unique properties
          const uniqueProperties = new Map()
          
          for (const edge of edges) {
            const property = properties.find(p => p.id === edge.target_property_id)
            if (property && !seenPropertyIds.includes(property.id) && !uniqueProperties.has(property.id)) {
              uniqueProperties.set(property.id, {
                ...property,
                similarity_score: edge.similarity_score,
                reason: 'graph_traversal'
              })
              
              if (uniqueProperties.size >= limit) break
            }
          }

          const recommendations = Array.from(uniqueProperties.values())
          
          if (recommendations.length > 0) {
            console.log(`🔗 Graph traversal returned ${recommendations.length} recommendations`)
            const response = NextResponse.json({ recommendations })
            response.headers.set('Access-Control-Allow-Origin', '*')
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            return response
          }
        }
      }
    } catch (graphError) {
      console.error('Error in graph traversal:', graphError)
    }

    // Final fallback to regular properties
    console.log('📋 Using fallback properties')
    let fallbackQuery = serverClient
      .from('property')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter out seen properties if any
    if (seenPropertyIds.length > 0) {
      fallbackQuery = fallbackQuery.not('id', 'in', `(${seenPropertyIds.join(',')})`)
    }

    const { data: properties, error: propertiesError } = await fallbackQuery

    if (propertiesError) {
      throw propertiesError
    }

    let recommendations = properties?.map(property => ({
      ...property,
      similarity_score: 0.5,
      reason: 'fallback'
    })) || []

    console.log(`🎯 Got ${recommendations.length} recommendations`)
    const response = NextResponse.json({ recommendations })
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

// Helper function to calculate distance between two coordinates
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

// Helper function to calculate vector similarity
function calculateVectorSimilarity(userEmbedding: any, propertyEmbedding: any): number {
  try {
    // Parse embeddings if they're strings
    const userVec = typeof userEmbedding === 'string' ? JSON.parse(userEmbedding) : userEmbedding
    const propertyVec = typeof propertyEmbedding === 'string' ? JSON.parse(propertyEmbedding) : propertyEmbedding

    if (!Array.isArray(userVec) || !Array.isArray(propertyVec)) {
      return 0.5 // Default similarity if embeddings are invalid
    }

    // Calculate cosine similarity
    let dotProduct = 0
    let userMagnitude = 0
    let propertyMagnitude = 0

    const minLength = Math.min(userVec.length, propertyVec.length)

    for (let i = 0; i < minLength; i++) {
      const userVal = userVec[i] || 0
      const propertyVal = propertyVec[i] || 0
      
      dotProduct += userVal * propertyVal
      userMagnitude += userVal * userVal
      propertyMagnitude += propertyVal * propertyVal
    }

    userMagnitude = Math.sqrt(userMagnitude)
    propertyMagnitude = Math.sqrt(propertyMagnitude)

    if (userMagnitude === 0 || propertyMagnitude === 0) {
      return 0.5 // Default similarity if magnitude is zero
    }

    const similarity = dotProduct / (userMagnitude * propertyMagnitude)
    
    // Normalize similarity to 0-1 range (cosine similarity is -1 to 1)
    return (similarity + 1) / 2

  } catch (error) {
    console.error('Error calculating vector similarity:', error)
    return 0.5 // Default similarity on error
  }
}
