import React, { useState, useEffect } from 'react';
import PropertyCard, { Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Heart, Loader2, AlertCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useMatches } from '@/contexts/MatchesContext';
import MatchesModal from './MatchesModal';
import AdvisorSidebar from './AdvisorSidebar';
import Chat from './Chat';

interface Pin {
  id: string;
  lat: number;
  lng: number;
}

interface SwipeInterfaceProps {
  onBackToMap: () => void;
  location: string;
  initialLat?: number;
  initialLng?: number;
  filters?: any;
}

const SwipeInterface: React.FC<SwipeInterfaceProps> = ({
  onBackToMap,
  location,
  initialLat,
  initialLng,
  filters
}) => {
  const { user } = useUser();
  const { matchesCount, addMatch } = useMatches();
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProperties, setLikedProperties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMatches, setShowMatches] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(true);
  const [isAnalyzingPreferences, setIsAnalyzingPreferences] = useState(false);
  const [hasAnalyzedPreferences, setHasAnalyzedPreferences] = useState(false);

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, [user?.id, initialLat, initialLng, filters]);

  const loadProperties = async () => {
    if (!user?.id) {
      console.log('❌ No user ID available, skipping property load');
      return;
    }
    
    console.log('👤 Loading properties for user:', user.id);
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      console.log('🎯 Loading properties for user:', user.id, 'at location:', location, 'coords:', initialLat, initialLng);
      console.log('🔍 Coordinate types:', { 
        initialLat: typeof initialLat, 
        initialLng: typeof initialLng,
        initialLatValue: initialLat,
        initialLngValue: initialLng
      });
      
      // Check if coordinates are valid, use default if not
      let finalLat = initialLat;
      let finalLng = initialLng;
      
      if (!initialLat || !initialLng || isNaN(initialLat) || isNaN(initialLng)) {
        console.warn('⚠️ Invalid coordinates provided, using default location (Chicago):', { initialLat, initialLng });
        finalLat = 41.8781; // Chicago default
        finalLng = -87.6298;
      }
      
      const requestBody = {
        userId: user.id,
        searchRadius: filters?.searchRadius || 500, // Use search radius from filters or default to 500km
        location: {
          lat: finalLat,
          lng: finalLng,
          name: location
        },
        filters: filters || {}
      };
      
      console.log('📤 Sending request to backend:', JSON.stringify(requestBody, null, 2));
      console.log('🔍 DEBUG - Filters being sent:', filters);
      console.log('🔍 DEBUG - Bedroom filter specifically:', filters?.bedrooms);
      console.log('🔍 DEBUG - Final coordinates:', { finalLat, finalLng });
      console.log('🔍 DEBUG - Search radius:', requestBody.searchRadius);
      
      // Direct call to your backend recommendations API with location
      const response = await fetch('http://localhost:3000/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('📊 Full response from backend:', data);
      console.log('📊 Loaded properties:', data.recommendations?.length || 0);
      console.log('📊 First property:', data.recommendations?.[0]);
      
      if (data.recommendations && data.recommendations.length > 0) {
        console.log('🏠 First property received:', {
          id: data.recommendations[0].id,
          address: data.recommendations[0].address,
          city: data.recommendations[0].city,
          state: data.recommendations[0].state,
          latitude: data.recommendations[0].latitude,
          longitude: data.recommendations[0].longitude,
          distance_km: data.recommendations[0].distance_km,
          reason: data.recommendations[0].reason,
          image: data.recommendations[0].image
        });
        console.log('🏠 All properties received:', data.recommendations.map(p => ({
          id: p.id,
          address: p.address,
          city: p.city,
          property_type: p.property_type,
          type: p.type
        })));
        setProperties(data.recommendations);
      } else {
        // No properties found with current filters
        console.log('⚠️ No properties found with current filters');
        setProperties([]);
        setError('No properties found matching your filters. Try adjusting your search criteria.');
      }
    } catch (error) {
      console.error('❌ Error loading properties:', error);
      setProperties([]);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user?.id) return;
    
    const currentProperty = properties[currentIndex];
    setLoading(true);
    
    try {
      // Direct call to backend interactions API
      await fetch('http://localhost:3000/api/user-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          propertyId: currentProperty.id,
          interactionType: 'like'
        }),
      });
      
      setLikedProperties(prev => [...prev, currentProperty.id]);
      
      // Trigger preference analysis after 5 likes
      if (likedProperties.length >= 4 && !hasAnalyzedPreferences) {
        setIsAnalyzingPreferences(true);
        setTimeout(() => {
          setIsAnalyzingPreferences(false);
          setHasAnalyzedPreferences(true);
        }, 2000);
      }
      
      nextProperty();
    } catch (error) {
      console.error('Error liking property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuperLike = async () => {
    if (!user?.id) return;
    
    const currentProperty = properties[currentIndex];
    setLoading(true);
    
    try {
      // Direct call to backend interactions API
      const response = await fetch('http://localhost:3000/api/user-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          propertyId: currentProperty.id,
          interactionType: 'superlike'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add to global matches state
        const newMatch = {
          ...currentProperty,
          superliked_at: new Date().toISOString(),
          interaction_id: data.interactionId || `${user.id}-${currentProperty.id}-${Date.now()}`
        };
        addMatch(newMatch);
      }
      
      setLikedProperties(prev => [...prev, currentProperty.id]);
      nextProperty();
    } catch (error) {
      console.error('Error super liking property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePass = async () => {
    if (!user?.id) return;
    
    const currentProperty = properties[currentIndex];
    setLoading(true);
    
    try {
      // Direct call to backend interactions API
      await fetch('http://localhost:3000/api/user-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          propertyId: currentProperty.id,
          interactionType: 'skip'
        }),
      });
      
      nextProperty();
    } catch (error) {
      console.error('Error passing property:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextProperty = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const currentProperty = properties[currentIndex];
  const hasMoreProperties = currentIndex < properties.length;
  const showEndScreen = currentIndex >= properties.length;

  if (showEndScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex flex-col items-center justify-center">
        <div className="text-center space-y-8 max-w-md">
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-gray-900/90 backdrop-blur-sm border border-gray-700/30 flex items-center justify-center shadow-lg mx-auto">
              <Heart className="h-10 w-10 text-pink-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-100">
                That's all for now!
              </h2>
              <p className="text-gray-400">
                You've seen all {properties.length} properties in this area.
              </p>
            </div>
          </div>
          
          {likedProperties.length > 0 && (
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-6 border border-gray-700/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-pink-900/30 flex items-center justify-center border border-pink-700/30">
                  <Heart className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-100">
                    Properties you liked: {likedProperties.length}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Great choices! Check your matches to see more details.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={onBackToMap}
            className="w-full bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700/90 transition-all duration-200 border border-gray-700/30 text-gray-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        </div>
      </div>
    );
  }

  if (!hasMoreProperties) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-gray-900/90 backdrop-blur-sm border border-gray-700/30 flex items-center justify-center shadow-lg mx-auto">
            <MapPin className="h-10 w-10 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-100">
              No properties found
            </h2>
            <p className="text-gray-400">
              Try placing a pin in a different location to discover more properties.
            </p>
          </div>
          <Button 
            onClick={onBackToMap}
            className="bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700/90 transition-all duration-200 border border-gray-700/30 text-gray-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/30 sticky top-0 z-10">
          <div className="p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBackToMap}
              className="p-2 rounded-full hover:bg-gray-800/50 transition-all duration-200 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center text-sm bg-gray-800/50 rounded-full px-4 py-2 backdrop-blur-sm border border-gray-700/30">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium text-gray-200">{location}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvisor(!showAdvisor)}
                className="text-cyan-400 hover:text-cyan-300 rounded-full p-2 hover:bg-cyan-900/20 transition-all duration-200"
                title="Toggle AI advisor"
              >
                🧠
              </Button>
              {matchesCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMatches(true)}
                  className="text-pink-400 hover:text-pink-300 rounded-full p-2 hover:bg-pink-900/20 transition-all duration-200"
                  title="View matches"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {matchesCount}
                </Button>
              )}
              <div className="text-sm bg-gray-800/50 rounded-full px-3 py-1 backdrop-blur-sm border border-gray-700/30">
                <span className="font-medium text-gray-200">{currentIndex + 1}</span>
                <span className="text-gray-400"> / {properties.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Property Cards Stack */}
        <div className="flex-1 relative p-6">
          <div className="h-full max-w-2xl mx-auto relative">
            {properties.slice(currentIndex, currentIndex + 3).map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                onLike={handleLike}
                onSuperLike={handleSuperLike}
                onPass={handlePass}
                loading={loading}
                isTop={index === 0}
              />
            ))}
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700/30">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-sm text-gray-300">Processing...</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg border border-red-500/30">
                <div className="text-center space-y-3 p-6">
                  <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100">No Properties Found</h3>
                  <p className="text-sm text-gray-300 max-w-sm">{error}</p>
                  <button 
                    onClick={() => loadProperties()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advisor Sidebar */}
      {showAdvisor && user?.id && (
        <div className="w-80 border-l border-gray-700/30 bg-gray-900/80 backdrop-blur-lg">
          <div className="p-4">
            <AdvisorSidebar
              userId={user.id}
              isAnalyzingPreferences={isAnalyzingPreferences}
              hasAnalyzedPreferences={hasAnalyzedPreferences}
            />
          </div>
        </div>
      )}

      {/* Matches Modal */}
      <MatchesModal
        isOpen={showMatches}
        onClose={() => setShowMatches(false)}
      />

      {/* REALestate.ai Brand Tag */}
      <div className="absolute bottom-4 left-6 bg-gray-900/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg z-[9999]">
        <span className="text-lg font-bebas tracking-wider text-gray-300">REALestate.ai</span>
      </div>
      <Chat />
    </div>
  );
};

// Mock data for fallback
const generateMockProperties = (): Property[] => [
  {
    id: '1',
    title: '3-Bed Modern Home',
    price: '$450,000',
    location: 'Austin, TX',
    type: 'Single Family',
    bedrooms: 3,
    bathrooms: 2,
    area: '1,800 sq ft',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
    description: 'Beautiful modern home in a great neighborhood.',
    cap_rate: 6.5,
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    square_feet: 1800
  },
  {
    id: '2',
    title: '2-Bed Condo',
    price: '$320,000',
    location: 'Denver, CO',
    type: 'Condo',
    bedrooms: 2,
    bathrooms: 2,
    area: '1,200 sq ft',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
    description: 'Stylish condo with modern amenities.',
    cap_rate: 5.8,
    address: '456 Oak Ave',
    city: 'Denver',
    state: 'CO',
    square_feet: 1200
  },
  {
    id: '3',
    title: '4-Bed Family Home',
    price: '$580,000',
    location: 'Phoenix, AZ',
    type: 'Single Family',
    bedrooms: 4,
    bathrooms: 3,
    area: '2,400 sq ft',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
    description: 'Spacious family home with large backyard and pool.',
    cap_rate: 7.2,
    address: '789 Pine St',
    city: 'Phoenix',
    state: 'AZ',
    square_feet: 2400
  }
];

export default SwipeInterface;