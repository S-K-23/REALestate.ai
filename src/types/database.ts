export interface Database {
  public: {
    Tables: {
      app_user: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          preferences: Record<string, any>
          user_embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          preferences?: Record<string, any>
          user_embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          preferences?: Record<string, any>
          user_embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      property: {
        Row: {
          id: string
          mls_number: string | null
          address: string
          city: string
          state: string
          zip_code: string | null
          latitude: number | null
          longitude: number | null
          price: number
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          lot_size: number | null
          property_type: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | null
          year_built: number | null
          description: string | null
          images: string[] | null
          monthly_rent: number | null
          cap_rate: number | null
          property_embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mls_number?: string | null
          address: string
          city: string
          state: string
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          price: number
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          lot_size?: number | null
          property_type?: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | null
          year_built?: number | null
          description?: string | null
          images?: string[] | null
          monthly_rent?: number | null
          cap_rate?: number | null
          property_embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mls_number?: string | null
          address?: string
          city?: string
          state?: string
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          price?: number
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          lot_size?: number | null
          property_type?: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | null
          year_built?: number | null
          description?: string | null
          images?: string[] | null
          monthly_rent?: number | null
          cap_rate?: number | null
          property_embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      interaction: {
        Row: {
          id: string
          user_id: string
          property_id: string
          interaction_type: 'like' | 'skip' | 'superlike'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          interaction_type: 'like' | 'skip' | 'superlike'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          interaction_type?: 'like' | 'skip' | 'superlike'
          created_at?: string
        }
      }
      edge: {
        Row: {
          id: string
          source_property_id: string
          target_property_id: string
          relationship_type: string
          similarity_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          source_property_id: string
          target_property_id: string
          relationship_type?: string
          similarity_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          source_property_id?: string
          target_property_id?: string
          relationship_type?: string
          similarity_score?: number | null
          created_at?: string
        }
      }
      recommendation_batch: {
        Row: {
          id: string
          user_id: string
          property_ids: string[]
          batch_number: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_ids: string[]
          batch_number?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_ids?: string[]
          batch_number?: number
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_property_recommendations: {
        Args: {
          p_user_id: string
          p_limit?: number
        }
        Returns: {
          property_id: string
          similarity_score: number
          reason: string
        }[]
      }
    }
    Enums: {
      property_type: 'single_family' | 'condo' | 'townhouse' | 'multi_family'
      interaction_type: 'like' | 'skip' | 'superlike'
    }
  }
}

export type Property = Database['public']['Tables']['property']['Row']
export type User = Database['public']['Tables']['app_user']['Row']
export type Interaction = Database['public']['Tables']['interaction']['Row']
export type RecommendationBatch = Database['public']['Tables']['recommendation_batch']['Row']
