import { supabase } from './supabase'

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

      // Try to get recommendations using graph traversal
      const { data: edges, error: edgesError } = await supabase
        .from('edge')
        .select('target_property_id, similarity_score')
        .order('similarity_score', { ascending: false })
        .limit(limit * 2) // Get more to filter out seen properties

      if (edgesError) {
        console.error('Error getting graph edges:', edgesError)
        // Fallback to regular properties
        return this.getProperties(limit)
      }

      if (edges && edges.length > 0) {
        // Get property IDs from edges
        const propertyIds = edges.map(edge => edge.target_property_id)
        
        // Get full property data
        const { data: properties, error: propertiesError } = await supabase
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
          return recommendations
        }
      }

      // Fallback to regular properties if no graph recommendations
      const { data: properties, error: propertiesError } = await supabase
        .from('property')
        .select('*')
        .not('id', 'in', `(${seenPropertyIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(limit)

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
