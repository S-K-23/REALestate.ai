import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, MapPin, Home, DollarSign, Star, Bed, Bath, Square } from 'lucide-react';

export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  description: string;
  cap_rate?: number;
  address?: string;
  city?: string;
  state?: string;
  square_feet?: number;
}

interface PropertyCardProps {
  property: Property;
  onLike: () => void;
  onSuperLike?: () => void;
  onPass: () => void;
  className?: string;
  loading?: boolean;
  isTop?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onLike, 
  onSuperLike,
  onPass, 
  className = "",
  loading = false,
  isTop = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getImageUrl = () => {
    if (property.image && property.image.length > 0) {
      return property.image;
    }
    return `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center&auto=format&q=80`;
  };

  return (
    <div
      className={`absolute inset-0 transition-all duration-300 ${
        isTop ? 'scale-100 z-10' : 'scale-95 z-0'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-2/3">
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-lg font-bold text-green-600">
              {property.price}
            </span>
          </div>
          {property.cap_rate && (
            <div className="absolute top-4 left-4 bg-blue-600/90 text-white rounded-full px-3 py-1">
              <span className="text-sm font-semibold">
                {property.cap_rate.toFixed(1)}% CAP
              </span>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-sm font-medium text-foreground">{property.type}</span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">
              {property.address || property.title}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {property.location}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                {property.square_feet.toLocaleString()} sq ft
              </div>
            )}
          </div>

          {property.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {property.description}
            </p>
          )}

          <div className="flex justify-center space-x-4 pt-2">
            <button
              onClick={onPass}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
              disabled={!isTop || loading}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            {onSuperLike && (
              <button
                onClick={onSuperLike}
                className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors disabled:opacity-50"
                disabled={!isTop || loading}
              >
                <Star className="w-6 h-6 text-blue-600" />
              </button>
            )}
            <button
              onClick={onLike}
              className="p-3 bg-green-100 hover:bg-green-200 rounded-full transition-colors disabled:opacity-50"
              disabled={!isTop || loading}
            >
              <Heart className="w-6 h-6 text-green-600" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PropertyCard;