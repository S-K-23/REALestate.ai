'use client'

import { useState, useEffect } from 'react'
import { Property } from '@/types/database'
import PropertyCard from './property-card'
import { backendService } from '@/lib/backend-service'

interface PropertyStackProps {
  userId: string
}

export default function PropertyStack({ userId }: PropertyStackProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [viewedProperties, setViewedProperties] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadProperties()
  }, [userId])

  const loadProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to get recommendations first
      let properties = await backendService.getRecommendations(userId, 20)
      
      // If no recommendations, get regular properties
      if (!properties || properties.length === 0) {
        properties = await backendService.getProperties(20)
      }
      
      setProperties(properties)
      
      // Mark first property as viewed if it exists
      if (properties.length > 0) {
        setViewedProperties(new Set([properties[0].id]))
      }
    } catch (error: any) {
      console.error('Error loading properties:', error)
      setError(error.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const loadMoreProperties = async () => {
    try {
      setLoadingMore(true)
      
      // Try to get more recommendations first
      let newProperties = await backendService.getRecommendations(userId, 10)
      
      // If no recommendations, get regular properties
      if (!newProperties || newProperties.length === 0) {
        newProperties = await backendService.getProperties(10)
      }
      
      // Filter out properties that have already been viewed
      const filteredProperties = newProperties.filter(property => !viewedProperties.has(property.id))
      
      // Add new properties to the existing list
      setProperties(prev => [...prev, ...filteredProperties])
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

      // Move to next property
      setCurrentIndex(prev => prev + 1)

      // If we're running low on properties, load more
      if (currentIndex >= properties.length - 3) {
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
      
      // Get personalized recommendations
      const recommendations = await backendService.getRecommendations(userId, 20)
      
      if (recommendations && recommendations.length > 0) {
        setProperties(prev => [...prev, ...recommendations])
      } else {
        // Fallback to regular properties if no recommendations
        const regularProperties = await backendService.getProperties(20)
        setProperties(prev => [...prev, ...regularProperties])
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
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

      {/* Loading indicator for more properties */}
      {loadingMore && (
        <div className="absolute top-4 right-4 z-20 bg-white/90 rounded-full p-3 shadow-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Property counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-white/90 rounded-full px-4 py-2 shadow-lg">
        <span className="text-sm font-medium text-gray-700">
          {currentIndex + 1} of {properties.length}
        </span>
      </div>

      {/* Show next 2-3 properties stacked behind */}
      {properties.slice(currentIndex, currentIndex + 3).map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          onSwipe={handleSwipe}
          isTop={index === 0}
        />
      ))}
    </div>
  )
}
