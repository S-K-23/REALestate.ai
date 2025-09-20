'use client'

import { useState, useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { Property } from '@/types/database'
import { formatPrice, formatSquareFeet } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, X, Star, MapPin, Bed, Bath, Square } from 'lucide-react'

interface PropertyCardProps {
  property: Property
  onSwipe: (propertyId: string, action: 'like' | 'skip' | 'superlike') => void
  isTop: boolean
}

export default function PropertyCard({ property, onSwipe, isTop }: PropertyCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | 'up' | null>(null)

  const handleDrag = (event: any, info: PanInfo) => {
    const threshold = 50
    const { x, y } = info.offset

    if (Math.abs(x) > Math.abs(y)) {
      if (x > threshold) {
        setDragDirection('right')
      } else if (x < -threshold) {
        setDragDirection('left')
      } else {
        setDragDirection(null)
      }
    } else {
      if (y < -threshold) {
        setDragDirection('up')
      } else {
        setDragDirection(null)
      }
    }
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    const { x, y } = info.offset

    setIsDragging(false)
    setDragDirection(null)

    if (Math.abs(x) > threshold || Math.abs(y) > threshold) {
      if (Math.abs(x) > Math.abs(y)) {
        onSwipe(property.id, x > 0 ? 'like' : 'skip')
      } else if (y < -threshold) {
        onSwipe(property.id, 'superlike')
      }
    }
  }

  const getImageUrl = () => {
    if (property.images && property.images.length > 0) {
      return property.images[0]
    }
    return `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center&auto=format&q=80`
  }

  const getOverlayColor = () => {
    if (!isTop) return ''
    if (dragDirection === 'right') return 'bg-green-500/20'
    if (dragDirection === 'left') return 'bg-red-500/20'
    if (dragDirection === 'up') return 'bg-blue-500/20'
    return ''
  }

  const getOverlayIcon = () => {
    if (!isTop) return null
    if (dragDirection === 'right') return <Heart className="w-16 h-16 text-green-500" />
    if (dragDirection === 'left') return <X className="w-16 h-16 text-red-500" />
    if (dragDirection === 'up') return <Star className="w-16 h-16 text-blue-500" />
    return null
  }

  return (
    <motion.div
      className="absolute inset-0"
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{
        scale: isTop ? 1 : 0.95,
        zIndex: isTop ? 10 : 1,
      }}
      transition={{ duration: 0.2 }}
      style={{ cursor: isTop ? 'grab' : 'default' }}
    >
      <Card className="h-full overflow-hidden">
        <div className="relative h-2/3">
          <img
            src={getImageUrl()}
            alt={property.address}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${getOverlayColor()}`}>
            {getOverlayIcon()}
          </div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(property.price)}
            </span>
          </div>
          {property.cap_rate && (
            <div className="absolute top-4 left-4 bg-blue-600/90 text-white rounded-full px-3 py-1">
              <span className="text-sm font-semibold">
                {property.cap_rate.toFixed(1)}% CAP
              </span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">
              {property.address}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {property.city}, {property.state}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                {property.bedrooms}
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                {property.bathrooms}
              </div>
            )}
            {property.square_feet && (
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                {formatSquareFeet(property.square_feet)}
              </div>
            )}
          </div>

          {property.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {property.description}
            </p>
          )}

          <div className="flex justify-center space-x-4 pt-2">
            <button
              onClick={() => onSwipe(property.id, 'skip')}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              disabled={!isTop}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => onSwipe(property.id, 'superlike')}
              className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
              disabled={!isTop}
            >
              <Star className="w-6 h-6 text-blue-600" />
            </button>
            <button
              onClick={() => onSwipe(property.id, 'like')}
              className="p-3 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
              disabled={!isTop}
            >
              <Heart className="w-6 h-6 text-green-600" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
