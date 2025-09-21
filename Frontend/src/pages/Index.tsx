import React, { useState, useEffect } from 'react';
import RealWorldMap from '@/components/RealWorldMap';
import MarketsSidebar from '@/components/MarketsSidebar';
import GrowingMarketsPanel from '@/components/GrowingMarketsPanel';
import SwipeInterface from '@/components/SwipeInterface';
import MatchesModal from '@/components/MatchesModal';
import MatchesList from '@/components/MatchesList';
import ProfilePanel from '@/components/ProfilePanel';
import SettingsPanel from '@/components/SettingsPanel';
import FilterPanel from '@/components/FilterPanel';
import Auth from '@/pages/Auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Chat from '@/components/Chat';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { generatePropertiesForLocation } from '@/data/mockProperties';
import { getLocationFromCoordinates } from '@/utils/locationUtils';
import { INVESTMENT_CITIES } from '@/data/investmentCities';
import { loadPropertiesForLocation, loadPropertiesForCity } from '@/lib/api-adapter';
import { useMatches } from '@/contexts/MatchesContext';
import { useUser } from '@/contexts/UserContext';
import { MapPin, Search, Loader2, CheckCircle, XCircle, BarChart3, Heart } from 'lucide-react';

interface Pin {
  id: string;
  lat: number;
  lng: number;
  isInvestmentCity?: boolean;
  isMatch?: boolean;
}

interface PendingPin {
  lat: number;
  lng: number;
  locationName: string;
}

type View = 'map' | 'swipe';

const Index = () => {
  const { user, loading: userLoading, logout } = useUser();
  const { matchesCount, matches } = useMatches();
  const [view, setView] = useState<View>('map');
  const [pins, setPins] = useState<Pin[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [isProcessingLocation, setIsProcessingLocation] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoomToLocation, setZoomToLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number; cityId?: string } | null>(null);
  const [showMatches, setShowMatches] = useState(false);
  const [showMatchesList, setShowMatchesList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  // Initialize with investment city pins and match pins
  useEffect(() => {
    const investmentPins: Pin[] = INVESTMENT_CITIES.map(city => ({
      id: city.id,
      lat: city.lat,
      lng: city.lng,
      isInvestmentCity: true
    }));

    // Add match pins if matches have coordinates
    const matchPins: Pin[] = matches
      .filter(match => match.latitude && match.longitude)
      .map(match => ({
        id: `match-${match.interaction_id}`,
        lat: match.latitude!,
        lng: match.longitude!,
        isInvestmentCity: false,
        isMatch: true
      }));

    setPins([...investmentPins, ...matchPins]);
  }, [matches]);

  const handlePinPlace = async (lat: number, lng: number) => {
    // Check if this is an investment city click
    const clickedInvestmentCity = INVESTMENT_CITIES.find(city => 
      Math.abs(city.lat - lat) < 0.1 && Math.abs(city.lng - lng) < 0.1
    );
    
    if (clickedInvestmentCity) {
      console.log('Clicked investment city:', clickedInvestmentCity);
      
      // Close sidebar if open and zoom to location
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      
      // Zoom to location
      setZoomToLocation({ lat, lng, zoom: 6 });
      
      // Set location info for sidebar display
      setCurrentLocation(clickedInvestmentCity.name);
      setSelectedPin({ lat, lng, cityId: clickedInvestmentCity.id });
      
      // Set pending pin for sidebar
      setPendingPin({
        lat,
        lng,
        locationName: clickedInvestmentCity.name
      });
      
      return;
    }
    
    // Prevent multiple simultaneous requests
    if (isProcessingLocation) {
      return;
    }
    
    // Close sidebar if open and zoom to location
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    
    // Trigger zoom to clicked location
    setZoomToLocation({ lat, lng, zoom: 6 });
    
    console.log('handlePinPlace called with:', lat, lng);
    setIsProcessingLocation(true);
    setIsLoadingLocation(true);
    
    try {
      // Get real location name from coordinates
      const locationResult = await getLocationFromCoordinates(lat, lng);
      console.log('Location result:', locationResult);
      
      // Set pending pin with location info
      setPendingPin({
        lat,
        lng,
        locationName: locationResult.displayName
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setPendingPin({
        lat,
        lng,
        locationName: 'Unknown Location'
      });
    } finally {
      setIsLoadingLocation(false);
      setIsProcessingLocation(false);
    }
  };

  const handleConfirmLocation = async () => {
    if (!pendingPin) return;
    
    const newPin: Pin = {
      id: Date.now().toString(),
      lat: pendingPin.lat,
      lng: pendingPin.lng,
      isInvestmentCity: false
    };

    // Replace all pins with just the new user pin and investment cities
    const investmentPins = INVESTMENT_CITIES.map(city => ({
      id: city.id,
      lat: city.lat,
      lng: city.lng,
      isInvestmentCity: true
    }));
    
    setPins([...investmentPins, newPin]);
    setCurrentLocation(pendingPin.locationName);
    setSelectedPin({ lat: pendingPin.lat, lng: pendingPin.lng });
    
    // Load real properties for this location
    setIsLoadingProperties(true);
    try {
      const newProperties = await loadPropertiesForLocation(pendingPin.lat, pendingPin.lng);
      if (newProperties.length === 0) {
        // Fallback to mock data if no real properties found
        const mockProperties = generatePropertiesForLocation(pendingPin.locationName);
        setProperties(mockProperties);
      } else {
        setProperties(newProperties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      // Fallback to mock data
      const mockProperties = generatePropertiesForLocation(pendingPin.locationName);
      setProperties(mockProperties);
    } finally {
      setIsLoadingProperties(false);
    }
    
    setPendingPin(null);
    setIsProcessingLocation(false);
    
    // Automatically open browse properties view
    setView('swipe');
  };

  const handleCancelLocation = () => {
    setPendingPin(null);
    setSelectedPin(null);
    setCurrentLocation('');
    setIsProcessingLocation(false);
  };

  const handleSidebarCancel = () => {
    setPendingPin(null);
    setSelectedPin(null);
    setCurrentLocation('');
  };

  const handleSidebarConfirm = async () => {
    if (!pendingPin) return;
    
    // Set the selected pin and current location
    setSelectedPin({ lat: pendingPin.lat, lng: pendingPin.lng });
    setCurrentLocation(pendingPin.locationName);
    
    // Clear pending pin
    setPendingPin(null);
    
    // Automatically open browse properties view
    // The SwipeInterface will load properties directly from the recommendations API
    setView('swipe');
  };

  const handleSearchProperties = () => {
    if (properties.length > 0) {
      setView('swipe');
    }
  };

  const handleBackToMap = () => {
    setView('map');
  };

  const handleHighlightMatch = (lat: number, lng: number) => {
    setZoomToLocation({ lat, lng, zoom: 12 });
  };

  if (view === 'swipe') {
    console.log('🎯 Rendering SwipeInterface with selectedPin:', selectedPin);
    console.log('🎯 Current location:', currentLocation);
    console.log('🎯 Coordinates being passed:', { lat: selectedPin?.lat, lng: selectedPin?.lng });
    
    console.log('🎯 Rendering SwipeInterface with activeFilters:', activeFilters);
    console.log('🎯 Bedroom filter being passed:', activeFilters?.bedrooms);
    
    return (
      <SwipeInterface
        onBackToMap={handleBackToMap}
        location={currentLocation}
        initialLat={selectedPin?.lat || currentLocation?.lat}
        initialLng={selectedPin?.lng || currentLocation?.lng}
        filters={activeFilters}
      />
    );
  }

  // Show loading screen while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication page if user is not logged in
  if (!user) {
    return <Auth onAuthSuccess={() => window.location.reload()} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full relative">
        {/* Main Content - Full Screen Map */}
        <div className="h-screen relative">
          <MarketsSidebar 
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            onMarketSelect={handlePinPlace}
            onLogout={() => {
              logout();
              window.location.reload();
            }}
            onMatchesClick={() => {
              setShowMatchesList(true);
              setIsSidebarOpen(false);
            }}
            onProfileClick={() => {
              setShowProfile(true);
              setIsSidebarOpen(false);
            }}
            onSettingsClick={() => {
              setShowSettings(true);
              setIsSidebarOpen(false);
            }}
            onFilterClick={() => {
              setShowFilter(true);
              setIsSidebarOpen(false);
            }}
          />

          {/* Growing Markets Panel */}
          <GrowingMarketsPanel 
            onMarketSelect={handlePinPlace} 
            selectedLocation={currentLocation} 
            selectedPin={selectedPin}
            pendingPin={pendingPin}
            onSidebarCancel={handleSidebarCancel}
            onSidebarConfirm={handleSidebarConfirm}
          />

          {/* Fallback toggle button when sidebar is collapsed */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="fixed top-4 left-8 z-[10000] w-12 h-12 rounded-full bg-white/95 backdrop-blur-lg border border-border/20 shadow-xl flex flex-col items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200 gap-1"
              aria-label="Open sidebar"
            >
              <div className="w-4 h-0.5 bg-primary rounded-full"></div>
              <div className="w-4 h-0.5 bg-primary rounded-full"></div>
              <div className="w-4 h-0.5 bg-primary rounded-full"></div>
            </button>
          )}
          
          {/* Map Container - Full Background */}
          <div className="absolute inset-0">
            <div className="w-full h-full">
              <RealWorldMap 
                onPinPlace={handlePinPlace} 
                pins={pins} 
                zoomToLocation={zoomToLocation}
              />
            </div>
            
            {/* Loading Location Display */}
            {isLoadingLocation && (
              <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-sm rounded-lg p-4 animate-slide-up">
                <div className="flex items-center text-sm">
                  <Loader2 className="h-4 w-4 mr-2 text-muted-foreground animate-spin" />
                  <span className="font-medium text-foreground">Getting location...</span>
                </div>
              </div>
            )}

            {/* Current Location Display */}
            {currentLocation && !isLoadingLocation && (
              <div className="absolute bottom-20 left-6 bg-background/90 backdrop-blur-sm rounded-lg p-4 animate-slide-up">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium text-foreground">{currentLocation}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {properties.length} properties found
                </p>
              </div>
            )}


            {/* REALestate.ai Brand Tag */}
            <div className="absolute bottom-4 left-6 bg-gray-900/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg z-[9999]">
              <span className="text-lg font-bebas tracking-wider text-gray-300">REALestate.ai</span>
            </div>
          </div>
        </div>

        {/* Matches List */}
        <MatchesList
          isOpen={showMatchesList}
          onClose={() => setShowMatchesList(false)}
          onViewDetails={(match) => {
            if (match.latitude && match.longitude) {
              handleHighlightMatch(match.latitude, match.longitude);
            }
          }}
        />

        {/* Profile Panel */}
        <ProfilePanel
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Filter Panel */}
        <FilterPanel
          isOpen={showFilter}
          onClose={() => setShowFilter(false)}
          onApplyFilters={(filters) => {
            console.log('🎯 Applied filters on map:', filters);
            console.log('🎯 Bedroom filter specifically:', filters?.bedrooms);
            setActiveFilters(filters);
            setShowFilter(false);
            // Filters will be automatically applied when SwipeInterface re-renders
          }}
        />

        {/* Matches Modal */}
        <MatchesModal
          isOpen={showMatches}
          onClose={() => setShowMatches(false)}
        />
      </div>

    </SidebarProvider>
  );
};

export default Index;