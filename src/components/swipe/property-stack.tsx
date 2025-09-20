'use client'

import { useState, useEffect } from 'react'
import { Property } from '@/types/database'
import PropertyCard from './property-card'
import PropertyFilter from '../filters/property-filter'
import MatchesList from '../matches/matches-list'
import { backendService } from '@/lib/backend-service'

interface PropertyStackProps {
  userId: string
  onPreferenceAnalysisChange?: (isAnalyzing: boolean, hasAnalyzed: boolean) => void
}

interface FilterState {
  minPrice: number | null
  maxPrice: number | null
  minSqft: number | null
  maxSqft: number | null
  minBedrooms: number | null
  maxBedrooms: number | null
  minBathrooms: number | null
  maxBathrooms: number | null
  states: string[]
  cities: string[]
  propertyTypes: string[]
  minYear: number | null
  maxYear: number | null
  minLotSize: number | null
  maxLotSize: number | null
  orderBy: string
  orderDirection: 'asc' | 'desc'
}

export default function PropertyStack({ userId, onPreferenceAnalysisChange }: PropertyStackProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [viewedProperties, setViewedProperties] = useState<Set<string>>(new Set())
  const [initialBatchCompleted, setInitialBatchCompleted] = useState(false)
  const [hasAnalyzedPreferences, setHasAnalyzedPreferences] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    minPrice: null,
    maxPrice: null,
    minSqft: null,
    maxSqft: null,
    minBedrooms: null,
    maxBedrooms: null,
    minBathrooms: null,
    maxBathrooms: null,
    states: [],
    cities: [],
    propertyTypes: [],
    minYear: null,
    maxYear: null,
    minLotSize: null,
    maxLotSize: null,
    orderBy: 'created_at',
    orderDirection: 'desc'
  })
  const [hasActiveFilters, setHasActiveFilters] = useState(false)
  const [showMatches, setShowMatches] = useState(false)
  const [matchesCount, setMatchesCount] = useState(0)

  useEffect(() => {
    loadProperties()
    loadMatchesCount()
  }, [userId])

  // Check if filters are active
  useEffect(() => {
    const isActive = Object.values(filters).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== null && value !== '' && value !== 'created_at' && value !== 'desc'
    })
    setHasActiveFilters(isActive)
  }, [filters])

  // Notify parent component when preference analysis states change
  useEffect(() => {
    if (onPreferenceAnalysisChange) {
      onPreferenceAnalysisChange(
        initialBatchCompleted && !hasAnalyzedPreferences,
        hasAnalyzedPreferences
      )
    }
  }, [initialBatchCompleted, hasAnalyzedPreferences, onPreferenceAnalysisChange])

  const loadFilteredProperties = async (appliedFilters: FilterState) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/properties/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...appliedFilters,
          userId,
          limit: 50
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
        setCurrentIndex(0)
        setViewedProperties(new Set())
      } else {
        throw new Error('Failed to load filtered properties')
      }
    } catch (error: any) {
      console.error('Error loading filtered properties:', error)
      setError(error.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const loadProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to get recommendations first via API route
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, limit: 50 }),
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.recommendations && data.recommendations.length > 0) {
            setProperties(data.recommendations)
            // Initialize viewed properties as empty - only track actual interactions
            setViewedProperties(new Set())
            return
          }
        }
      } catch (recommendationError) {
        console.log('Recommendations API failed, falling back to regular properties:', recommendationError)
      }
      
      // Fallback to regular properties
      const properties = await backendService.getProperties(50)
      setProperties(properties)
      
      // Initialize viewed properties as empty - only track actual interactions
      setViewedProperties(new Set())
    } catch (error: any) {
      console.error('Error loading properties:', error)
      setError(error.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const analyzeUserPreferencesAndReorient = async () => {
    try {
      console.log('🎯 REALagent analyzing user preferences for reorientation...')
      
      // Get user's interactions to analyze preferences
      const response = await fetch('/api/user-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to get user interactions')
      }

      const data = await response.json()
      const interactions = data.interactions || []
      
      // Analyze liked properties to understand preferences
      const likedProperties = interactions
        .filter((i: any) => i.interaction_type === 'like' || i.interaction_type === 'superlike')
        .map((i: any) => i.property)
        .filter(Boolean)

      if (likedProperties.length === 0) {
        console.log('📊 No liked properties found, continuing with general recommendations')
        return
      }

      // Calculate preference insights
      const preferences = {
        avgPrice: likedProperties.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / likedProperties.length,
        avgBedrooms: likedProperties.reduce((sum: number, p: any) => sum + (p.bedrooms || 0), 0) / likedProperties.length,
        avgBathrooms: likedProperties.reduce((sum: number, p: any) => sum + (p.bathrooms || 0), 0) / likedProperties.length,
        avgSquareFeet: likedProperties.reduce((sum: number, p: any) => sum + (p.square_feet || 0), 0) / likedProperties.length,
        preferredCities: [...new Set(likedProperties.map((p: any) => p.city).filter(Boolean))],
        preferredPropertyTypes: [...new Set(likedProperties.map((p: any) => p.property_type).filter(Boolean))]
      }

      console.log('🧠 REALagent preference analysis:', preferences)

      // Update user embedding based on preferences
      await fetch('/api/update-user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      setHasAnalyzedPreferences(true)
      console.log('✅ User preferences analyzed and embedding updated for personalized recommendations')
      
    } catch (error) {
      console.error('Error analyzing user preferences:', error)
    }
  }

  const loadMoreProperties = async () => {
    if (loadingMore) return // Prevent multiple concurrent loads
    
    try {
      setLoadingMore(true)
      
      // Check if we've completed the initial batch and should analyze preferences
      if (currentIndex >= 30 && !initialBatchCompleted && !hasAnalyzedPreferences) {
        setInitialBatchCompleted(true)
        await analyzeUserPreferencesAndReorient()
      }
      
      // Try to get more recommendations first (now with updated user preferences)
      let newProperties = await backendService.getRecommendations(userId, 25)
      
      // If no recommendations, get regular properties
      if (!newProperties || newProperties.length === 0) {
        newProperties = await backendService.getProperties(25)
      }
      
      // Filter out properties that are already in the current list
      setProperties(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const filteredProperties = newProperties.filter((property: Property) => !existingIds.has(property.id))
        return [...prev, ...filteredProperties]
      })
    } catch (error: any) {
      console.error('Error loading more properties:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSwipe = async (propertyId: string, action: 'like' | 'skip' | 'superlike') => {
    try {
      // Record the interaction directly via API
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
        // If it's a duplicate interaction error, that's okay - just continue
        if (errorData.error && errorData.error.includes('duplicate key value violates unique constraint')) {
          console.log('Interaction already exists, continuing...')
        } else {
          throw new Error(errorData.error || 'Failed to record interaction')
        }
      }

      // Mark property as viewed
      setViewedProperties(prev => new Set([...prev, propertyId]))

      // Update matches count if it was a superlike
      if (action === 'superlike') {
        setMatchesCount(prev => prev + 1)
      }

      // Move to next property
      setCurrentIndex(prev => prev + 1)

      // If we're running low on properties, load more
      if (currentIndex >= properties.length - 5) {
        await loadMoreProperties()
      }
    } catch (error) {
      console.error('Error recording interaction:', error)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      
      // Get personalized recommendations via API route
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, limit: 20 }),
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.recommendations && data.recommendations.length > 0) {
            setProperties(prev => [...prev, ...data.recommendations])
            return
          }
        }
      } catch (recommendationError) {
        console.log('Recommendations API failed, falling back to regular properties:', recommendationError)
      }
      
      // Fallback to regular properties if no recommendations
      const regularProperties = await backendService.getProperties(20)
      setProperties(prev => [...prev, ...regularProperties])
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleApplyFilters = (appliedFilters: FilterState) => {
    loadFilteredProperties(appliedFilters)
  }

  const loadMatchesCount = async () => {
    try {
      const response = await fetch(`/api/user/matches?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMatchesCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error loading matches count:', error)
    }
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      minPrice: null,
      maxPrice: null,
      minSqft: null,
      maxSqft: null,
      minBedrooms: null,
      maxBedrooms: null,
      minBathrooms: null,
      maxBathrooms: null,
      states: [],
      cities: [],
      propertyTypes: [],
      minYear: null,
      maxYear: null,
      minLotSize: null,
      maxLotSize: null,
      orderBy: 'created_at',
      orderDirection: 'desc'
    }
    setFilters(clearedFilters)
    loadProperties() // Load regular properties without filters
  }

  const currentProperty = properties[currentIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2 text-red-600">Error Loading Properties</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProperties}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!currentProperty) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold mb-2">No more properties!</h3>
          <p className="text-gray-600 mb-4">You've seen all available properties in your area.</p>
          <button
            onClick={loadProperties}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* Back button - only show after first property */}
      {currentIndex > 0 && (
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
          title="Go back to previous property"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Matches button */}
      <button
        onClick={() => setShowMatches(true)}
        className="absolute top-4 right-4 z-20 bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
        title="View your matches"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
        {matchesCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {matchesCount}
          </div>
        )}
      </button>

      {/* Filter button */}
      <button
        onClick={() => setShowFilters(true)}
        className={`absolute top-16 right-4 z-20 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 ${
          hasActiveFilters 
            ? 'bg-blue-600 text-white' 
            : 'bg-white/90 hover:bg-white text-gray-800'
        }`}
        title="Filter properties"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        {hasActiveFilters && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        )}
      </button>

      {/* Clear filters button - only show when filters are active */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="absolute top-28 right-4 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1 text-sm shadow-lg transition-all duration-200"
          title="Clear all filters"
        >
          Clear Filters
        </button>
      )}

      {/* Loading indicator for more properties */}
      {loadingMore && (
        <div className="absolute top-32 right-4 z-20 bg-white/90 rounded-full p-3 shadow-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* REALagent preference analysis indicator */}
      {initialBatchCompleted && !hasAnalyzedPreferences && (
        <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse">🧠</div>
            <span className="text-sm font-medium">REALagent analyzing...</span>
          </div>
        </div>
      )}

      {/* Preference analysis completed indicator */}
      {hasAnalyzedPreferences && currentIndex >= 30 && (
        <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <span>✨</span>
            <span className="text-sm font-medium">Personalized!</span>
          </div>
        </div>
      )}

      

      {/* Show next 2-3 properties stacked behind */}
      {properties.slice(currentIndex, currentIndex + 3).map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          onSwipe={handleSwipe}
          isTop={index === 0}
        />
      ))}

      {/* Property Filter Modal */}
      <PropertyFilter
        userId={userId}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Matches List Modal */}
      <MatchesList
        userId={userId}
        isOpen={showMatches}
        onClose={() => setShowMatches(false)}
      />
    </div>
  )
}
