'use client'

import { useState, useEffect } from 'react'

interface FilterState {
  // Price range
  minPrice: number | null
  maxPrice: number | null
  
  // Square footage
  minSqft: number | null
  maxSqft: number | null
  
  // Bedrooms
  minBedrooms: number | null
  maxBedrooms: number | null
  
  // Bathrooms
  minBathrooms: number | null
  maxBathrooms: number | null
  
  // Location
  states: string[]
  cities: string[]
  
  // Property type
  propertyTypes: string[]
  
  // Year built
  minYear: number | null
  maxYear: number | null
  
  // Lot size
  minLotSize: number | null
  maxLotSize: number | null
  
  // Sorting
  orderBy: string
  orderDirection: 'asc' | 'desc'
}

interface PropertyFilterProps {
  userId?: string
  onFiltersChange: (filters: FilterState) => void
  onApplyFilters: (filters: FilterState) => void
  isOpen: boolean
  onClose: () => void
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi_family', label: 'Multi-Family' }
]

export default function PropertyFilter({ 
  userId, 
  onFiltersChange, 
  onApplyFilters, 
  isOpen, 
  onClose 
}: PropertyFilterProps) {
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

  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load available cities based on selected states
  useEffect(() => {
    if (filters.states.length > 0) {
      loadCitiesForStates(filters.states)
    } else {
      setAvailableCities([])
    }
  }, [filters.states])

  const loadCitiesForStates = async (states: string[]) => {
    try {
      setLoading(true)
      const response = await fetch('/api/properties/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ states })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAvailableCities(data.cities || [])
      }
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClearFilters = () => {
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
    onFiltersChange(clearedFilters)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Property Filters</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Square Footage */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Square Footage</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min Sq Ft"
                  value={filters.minSqft || ''}
                  onChange={(e) => updateFilter('minSqft', e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max Sq Ft"
                  value={filters.maxSqft || ''}
                  onChange={(e) => updateFilter('maxSqft', e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <div className="flex space-x-2">
                <select
                  value={filters.minBedrooms || ''}
                  onChange={(e) => updateFilter('minBedrooms', e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Min Bedrooms</option>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}+</option>
                  ))}
                </select>
                <select
                  value={filters.maxBedrooms || ''}
                  onChange={(e) => updateFilter('maxBedrooms', e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Max Bedrooms</option>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <div className="flex space-x-2">
                <select
                  value={filters.minBathrooms || ''}
                  onChange={(e) => updateFilter('minBathrooms', e.target.value ? parseFloat(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Min Bathrooms</option>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(num => (
                    <option key={num} value={num}>{num}+</option>
                  ))}
                </select>
                <select
                  value={filters.maxBathrooms || ''}
                  onChange={(e) => updateFilter('maxBathrooms', e.target.value ? parseFloat(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Max Bathrooms</option>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* States */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">States</label>
              <select
                multiple
                value={filters.states}
                onChange={(e) => updateFilter('states', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Cities */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cities</label>
              <select
                multiple
                value={filters.cities}
                onChange={(e) => updateFilter('cities', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
                disabled={availableCities.length === 0}
              >
                {loading ? (
                  <option>Loading cities...</option>
                ) : (
                  availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))
                )}
              </select>
            </div>

            {/* Property Types */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Property Types</label>
              <div className="space-y-2">
                {PROPERTY_TYPES.map(type => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.propertyTypes.includes(type.value)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.propertyTypes, type.value]
                          : filters.propertyTypes.filter(t => t !== type.value)
                        updateFilter('propertyTypes', newTypes)
                      }}
                      className="mr-2"
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Year Built */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Year Built</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min Year"
                  value={filters.minYear || ''}
                  onChange={(e) => updateFilter('minYear', e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                />
                <input
                  type="number"
                  placeholder="Max Year"
                  value={filters.maxYear || ''}
                  onChange={(e) => updateFilter('maxYear', e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Lot Size */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Lot Size (acres)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Min Lot Size"
                  value={filters.minLotSize || ''}
                  onChange={(e) => updateFilter('minLotSize', e.target.value ? parseFloat(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Max Lot Size"
                  value={filters.maxLotSize || ''}
                  onChange={(e) => updateFilter('maxLotSize', e.target.value ? parseFloat(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={filters.orderBy}
                  onChange={(e) => updateFilter('orderBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Date Added</option>
                  <option value="price">Price</option>
                  <option value="square_feet">Square Footage</option>
                  <option value="bedrooms">Bedrooms</option>
                  <option value="bathrooms">Bathrooms</option>
                  <option value="year_built">Year Built</option>
                </select>
                <select
                  value={filters.orderDirection}
                  onChange={(e) => updateFilter('orderDirection', e.target.value as 'asc' | 'desc')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear All Filters
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
