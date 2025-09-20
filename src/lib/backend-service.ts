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

  async getProperties(limit: number = 20, offset: number = 0) {
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

  async getRecommendations(userId: string, limit: number = 20) {
    if (!this.useSupabase) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      // Try to get recommendations from Supabase function
      const { data, error } = await supabase
        .rpc('get_property_recommendations', {
          p_user_id: userId,
          p_limit: limit
        })

      if (error) throw error

      if (data && data.length > 0) {
        // Get full property data for recommendations
        const propertyIds = data.map((rec: any) => rec.property_id)
        const { data: properties, error: propertiesError } = await supabase
          .from('property')
          .select('*')
          .in('id', propertyIds)

        if (propertiesError) throw propertiesError

        // Combine properties with recommendation scores
        return propertyIds
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
      }
    } catch (error) {
      console.warn('Supabase recommendations error, falling back to regular properties:', error)
      // Fall back to regular properties instead of demo data
      return await this.getProperties(limit)
    }

    // Fallback to regular properties if no recommendations
    return await this.getProperties(limit)
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