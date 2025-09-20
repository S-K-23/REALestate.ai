import { supabase } from './supabase'
import { createServerClient } from './supabase'

export class BackendService {
  private useSupabase: boolean = false

  constructor() {
    // Check if we have valid Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    this.useSupabase = !!(supabaseUrl && supabaseKey && 
      supabaseUrl !== 'your_supabase_url_here' && 
      supabaseUrl !== 'https://placeholder.supabase.co')
  }

  async getProperties(limit: number = 50, offset: number = 0) {
    if (!this.useSupabase) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      const { data, error } = await supabase
        .from('property')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching properties from Supabase:', error)
      throw error
    }
  }

  async getRecommendations(userId: string, limit: number = 50) {
    if (!this.useSupabase) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      // Get user's interactions to exclude already seen properties
      const { data: interactions } = await supabase
        .from('interaction')
        .select('property_id')
        .eq('user_id', userId)
        .in('interaction_type', ['like', 'skip'])

      const seenPropertyIds = interactions?.map(i => i.property_id) || []

      // Use server client for recommendations
      const serverClient = createServerClient()
      
      // Verify server client is working
      if (!serverClient) {
        console.error('Failed to create server client')
        return this.getProperties(limit)
      }

      // Check if user has an embedding for vector search
      const { data: userData, error: userError } = await serverClient
        .from('app_user')
        .select('user_embedding')
        .eq('id', userId)
        .single()

      console.log('🔍 User data query result:', { userData, userError })

      const userEmbedding = userData?.user_embedding

      if (userEmbedding) {
        console.log('🎯 Using vector search with user embedding')
        console.log('🎯 User embedding type:', typeof userEmbedding)
        console.log('🎯 User embedding length:', userEmbedding.length)
        
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
          return this.getProperties(limit)
        }

        if (allProperties && allProperties.length > 0) {
          // Calculate vector similarities
          const recommendations = allProperties.map(property => {
            const similarity = this.calculateVectorSimilarity(userEmbedding, property.property_embedding)
            return {
              ...property,
              similarity_score: similarity,
              reason: 'vector_similarity'
            }
          })
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .slice(0, limit)

          console.log(`🎯 Vector search returned ${recommendations.length} recommendations`)
          return recommendations
        }
      }

      // Fallback to graph traversal if no user embedding
      console.log('🔗 Using graph traversal (no user embedding)')
      
      try {
        const { data: edges, error: edgesError } = await serverClient
          .from('edge')
          .select('target_property_id, similarity_score')
          .order('similarity_score', { ascending: false })
          .limit(limit * 2) // Get more to filter out seen properties

        if (edgesError) {
          console.error('Error getting graph edges:', edgesError)
          console.error('Error details:', JSON.stringify(edgesError, null, 2))
          // Fallback to regular properties
          return this.getProperties(limit)
        }

        if (!edges || edges.length === 0) {
          console.log('📊 No graph edges found, using fallback')
          return this.getProperties(limit)
        }

        // Get property IDs from edges
        const propertyIds = edges.map(edge => edge.target_property_id)
        
        // Get full property data
        const { data: properties, error: propertiesError } = await serverClient
          .from('property')
          .select('*')
          .in('id', propertyIds)

        if (propertiesError) {
          console.error('Error getting properties for recommendations:', propertiesError)
          return this.getProperties(limit)
        }

        // Filter out seen properties and get unique properties
        const uniqueProperties = new Map()
        
        for (const edge of edges) {
          const property = properties?.find(p => p.id === edge.target_property_id)
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
          return recommendations
        }

      } catch (graphError) {
        console.error('Error in graph traversal:', graphError)
        // Fallback to regular properties
        return this.getProperties(limit)
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

      if (propertiesError) throw propertiesError

      return properties?.map(property => ({
        ...property,
        similarity_score: 0.5,
        reason: 'fallback'
      })) || []

    } catch (error) {
      console.error('Error getting recommendations:', error)
      // Final fallback to regular properties
      return this.getProperties(limit)
    }
  }

  private calculateVectorSimilarity(userEmbedding: any, propertyEmbedding: any): number {
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

  async recordInteraction(userId: string, propertyId: string, action: 'like' | 'skip' | 'superlike') {
    if (!this.useSupabase) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      // Call the API route instead of direct Supabase calls
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          propertyId,
          interactionType: action
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to record interaction')
      }

      return { success: true }
    } catch (error) {
      console.error('Error recording interaction:', error)
      throw error
    }
  }

  async getUserInteractions(userId: string) {
    if (!this.useSupabase) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      // Call the API route instead of direct Supabase calls
      const response = await fetch('/api/user-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get user interactions')
      }

      const data = await response.json()
      return data.interactions || []
    } catch (error) {
      console.error('Error getting user interactions:', error)
      throw error
    }
  }

  async updateUserEmbedding(userId: string) {
    if (!this.useSupabase) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      // Call the API route instead of direct Supabase calls
      const response = await fetch('/api/update-user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user embedding')
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating user embedding:', error)
      throw error
    }
  }

  isUsingSupabase() {
    return this.useSupabase
  }
}

export const backendService = new BackendService()
