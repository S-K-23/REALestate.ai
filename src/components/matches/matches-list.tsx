'use client'

import { useState, useEffect } from 'react'
import { Property } from '@/types/database'

interface Match extends Property {
  superliked_at: string
  interaction_id: string
}

interface MatchesListProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export default function MatchesList({ userId, isOpen, onClose }: MatchesListProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadMatches()
    }
  }, [isOpen, userId])

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/user/matches?userId=${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
      } else {
        throw new Error('Failed to load matches')
      }
    } catch (error: any) {
      console.error('Error loading matches:', error)
      setError(error.message || 'Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const removeMatch = async (interactionId: string) => {
    try {
      setRemovingId(interactionId)
      
      const response = await fetch('/api/user/matches', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interactionId }),
      })

      if (response.ok) {
        // Remove the match from local state
        setMatches(prev => prev.filter(match => match.interaction_id !== interactionId))
      } else {
        throw new Error('Failed to remove match')
      }
    } catch (error: any) {
      console.error('Error removing match:', error)
      setError(error.message || 'Failed to remove match')
    } finally {
      setRemovingId(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Matches</h2>
              <p className="text-gray-600 mt-1">
                Properties you've super liked ({matches.length})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading matches...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && matches.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No matches yet</h3>
              <p className="text-gray-600">
                Start swiping and super like properties you love to see them here!
              </p>
            </div>
          )}

          {!loading && !error && matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto">
              {matches.map((match) => (
                <div key={match.interaction_id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Property Image */}
                  <div className="relative">
                    {match.images && match.images.length > 0 ? (
                      <img
                        src={match.images[0]}
                        alt={match.address}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <span className="text-gray-400 text-4xl">🏠</span>
                      </div>
                    )}
                    
                    {/* Super liked indicator */}
                    <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeMatch(match.interaction_id)}
                      disabled={removingId === match.interaction_id}
                      className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors disabled:opacity-50"
                      title="Remove from matches"
                    >
                      {removingId === match.interaction_id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {formatPrice(match.price)}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {match.property_type?.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-2">
                      {match.address}, {match.city}, {match.state}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      {match.bedrooms && (
                        <span>{match.bedrooms} bed{match.bedrooms !== 1 ? 's' : ''}</span>
                      )}
                      {match.bathrooms && (
                        <span>{match.bathrooms} bath{match.bathrooms !== 1 ? 's' : ''}</span>
                      )}
                      {match.square_feet && (
                        <span>{match.square_feet.toLocaleString()} sq ft</span>
                      )}
                    </div>

                    {match.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {match.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Super liked on {formatDate(match.superliked_at)}</span>
                      {match.mls_number && (
                        <span>MLS: {match.mls_number}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
