import React from 'react';
import { Property } from './PropertyCard';
import { MapPin, Bed, Bath, Square, DollarSign, TrendingUp } from 'lucide-react';

interface PropertyCardChatProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export const PropertyCardChat: React.FC<PropertyCardChatProps> = ({ property, onSelect }) => {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer max-w-sm"
      onClick={() => onSelect?.(property)}
    >
      {/* Property Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <img
          src={property.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center&auto=format&q=80'}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        {property.cap_rate && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {property.cap_rate}% cap rate
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {property.price}
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {property.type}
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            <span>{property.area}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {property.description}
        </p>

        {/* Investment Info */}
        {property.cap_rate && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Investment Potential</span>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="font-medium">{property.cap_rate}% cap rate</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};