import React from 'react';
import { MapPin, DollarSign, BarChart3, Users, Building2, Target, ArrowUpRight, ArrowDownRight, Minus, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { LOCATION_STATS, LocationStats } from '@/data/locationStats';
import { INVESTMENT_CITIES } from '@/data/investmentCities';
import LocationStatsDisplay from './LocationStatsDisplay';
import { Button } from '@/components/ui/button';

interface Market {
  id: string;
  name: string;
  country: string;
  growth: string;
  yield: string;
  trend: 'up' | 'neutral' | 'down';
  lat: number;
  lng: number;
  avgPrice: string;
  pricePerSqft: string;
  population: string;
  employmentRate: string;
  investmentVolume: string;
  rentalDemand: 'high' | 'medium' | 'low';
  marketCap: string;
  priceChange3m: string;
}

const fastGrowingMarkets: Market[] = [
  {
    id: '1',
    name: 'Dubai',
    country: 'UAE',
    growth: '+12.5%',
    yield: '8.2%',
    trend: 'up',
    lat: 25.2048,
    lng: 55.2708,
    avgPrice: '$850K',
    pricePerSqft: '$420',
    population: '3.5M',
    employmentRate: '96.2%',
    investmentVolume: '$2.1B',
    rentalDemand: 'high',
    marketCap: '$45.2B',
    priceChange3m: '+8.3%'
  },
  {
    id: '2',
    name: 'Austin',
    country: 'USA',
    growth: '+15.3%',
    yield: '6.8%',
    trend: 'up',
    lat: 30.2672,
    lng: -97.7431,
    avgPrice: '$520K',
    pricePerSqft: '$285',
    population: '2.3M',
    employmentRate: '97.1%',
    investmentVolume: '$1.8B',
    rentalDemand: 'high',
    marketCap: '$32.7B',
    priceChange3m: '+11.2%'
  },
  {
    id: '3',
    name: 'Miami',
    country: 'USA',
    growth: '+13.4%',
    yield: '5.9%',
    trend: 'up',
    lat: 25.7617,
    lng: -80.1918,
    avgPrice: '$675K',
    pricePerSqft: '$380',
    population: '6.1M',
    employmentRate: '95.8%',
    investmentVolume: '$2.8B',
    rentalDemand: 'high',
    marketCap: '$41.3B',
    priceChange3m: '+10.1%'
  },
  {
    id: '4',
    name: 'Toronto',
    country: 'Canada',
    growth: '+11.2%',
    yield: '5.7%',
    trend: 'up',
    lat: 43.6532,
    lng: -79.3832,
    avgPrice: 'C$780K',
    pricePerSqft: 'C$650',
    population: '6.2M',
    employmentRate: '95.3%',
    investmentVolume: 'C$2.5B',
    rentalDemand: 'high',
    marketCap: 'C$58.1B',
    priceChange3m: '+9.1%'
  }
];

interface GrowingMarketsPanelProps {
  onMarketSelect: (lat: number, lng: number) => void;
  selectedLocation?: string;
  selectedPin?: { lat: number; lng: number; cityId?: string };
  pendingPin?: { lat: number; lng: number; locationName: string } | null;
  onSidebarCancel?: () => void;
  onSidebarConfirm?: () => void;
}

const getTrendIcon = (trend: Market['trend']) => {
  switch (trend) {
    case 'up':
      return <ArrowUpRight className="h-3 w-3 text-emerald-500" />;
    case 'down':
      return <ArrowDownRight className="h-3 w-3 text-red-500" />;
    default:
      return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
};

const getRentalDemandColor = (demand: Market['rentalDemand']) => {
  switch (demand) {
    case 'high':
      return 'text-emerald-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
};

const GrowingMarketsPanel: React.FC<GrowingMarketsPanelProps> = ({ 
  onMarketSelect, 
  selectedLocation, 
  selectedPin, 
  pendingPin, 
  onSidebarCancel, 
  onSidebarConfirm 
}) => {
  const handleMarketClick = (market: Market) => {
    onMarketSelect(market.lat, market.lng);
  };

  // Find location stats for the selected pin
  const getLocationStats = (): LocationStats | null => {
    if (!selectedPin) return null;
    
    console.log('Getting location stats for selectedPin:', selectedPin);
    
    // If we have a cityId, use it directly
    if (selectedPin.cityId && LOCATION_STATS[selectedPin.cityId]) {
      console.log('Found stats using cityId:', selectedPin.cityId);
      return LOCATION_STATS[selectedPin.cityId];
    }
    
    // Fallback to coordinate matching with increased tolerance
    const matchingCity = INVESTMENT_CITIES.find(city => 
      Math.abs(city.lat - selectedPin.lat) < 0.1 && 
      Math.abs(city.lng - selectedPin.lng) < 0.1
    );
    
    console.log('Matching city by coordinates:', matchingCity);
    
    if (matchingCity && LOCATION_STATS[matchingCity.id]) {
      console.log('Found stats using coordinate match:', matchingCity.id);
      return LOCATION_STATS[matchingCity.id];
    }
    
    console.log('No location stats found');
    return null;
  };

  const locationStats = getLocationStats();
  const showLocationStats = selectedLocation && selectedPin;
  const showPendingConfirmation = pendingPin && !showLocationStats;

  return (
    <div className="fixed top-4 right-4 z-[9999] w-60 h-[calc(100vh-2rem)] 
      transition-all duration-500 ease-in-out animate-fade-in
      bg-background/98 backdrop-blur-xl
      border border-border/60 rounded-2xl
      shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)]
      overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-accent/5 before:rounded-2xl before:pointer-events-none
    ">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            {showPendingConfirmation || showLocationStats ? (
              <MapPin className="h-5 w-5 text-primary" />
            ) : (
              <TrendingUp className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-white">
              {showPendingConfirmation ? pendingPin?.locationName : (showLocationStats ? 'Location Stats' : 'Growing Markets')}
            </h2>
            <p className="text-xs text-white/80">
              {showPendingConfirmation ? 'Confirm selection' : (showLocationStats ? selectedLocation : 'High-yield opportunities')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100%-5rem)]">
        <div className="p-2">
          {showPendingConfirmation ? (
            // Show location stats and confirmation for pinned city
            locationStats ? (
              <div className="space-y-3 p-2">
                <LocationStatsDisplay locationStats={locationStats} />
                
                {/* Confirmation Box */}
                <div className="p-4 bg-muted/50 rounded-xl border border-border/30">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Confirm Location</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore properties in {pendingPin?.locationName}?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={onSidebarCancel}
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onSidebarConfirm}
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Show no information and confirmation
              <div className="space-y-3 p-2">
                <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                  <AlertCircle className="h-8 w-8 text-white mb-2" />
                  <h3 className="font-semibold text-white mb-1">No Market Data</h3>
                  <p className="text-xs text-white/80">
                    Limited information for this location.
                  </p>
                </div>
                
                {/* Confirmation Box */}
                <div className="p-4 bg-muted/50 rounded-xl border border-border/30">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Confirm Location</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore properties in {pendingPin?.locationName}?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={onSidebarCancel}
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onSidebarConfirm}
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </div>
            )
          ) : showLocationStats ? (
            // Show location stats for already confirmed location + browse properties
            <div className="space-y-4">
              {locationStats ? (
                <div className="p-2">
                  <LocationStatsDisplay locationStats={locationStats} />
                </div>
              ) : (
                // No information available
                <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                  <AlertCircle className="h-8 w-8 text-white mb-2" />
                  <h3 className="font-semibold text-white mb-1">No Market Data</h3>
                  <p className="text-xs text-white/80">
                    Limited information for this location.
                  </p>
                </div>
              )}
              
              {/* Browse Properties Card */}
              <div className="border-t border-border/30 pt-4">
                <div className="p-4 bg-muted/50 rounded-xl border border-border/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Browse Properties</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore investment opportunities in {selectedLocation}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={onSidebarCancel}
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onSidebarConfirm}
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Browse
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Show growing markets
            <div className="space-y-3 p-2">
              {fastGrowingMarkets.map((market, index) => (
                <div
                  key={market.id}
                  onClick={() => handleMarketClick(market)}
                  className="group relative p-4 rounded-xl bg-white/10 border border-border/30 hover:border-primary/20 hover:bg-white/20 transition-all duration-300 cursor-pointer hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Market Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {market.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{market.country}</p>
                      </div>
                    </div>
                    {getTrendIcon(market.trend)}
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Growth (YoY)</div>
                      <div className="text-sm font-semibold text-emerald-500">{market.growth}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Yield</div>
                      <div className="text-sm font-semibold text-foreground">{market.yield}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Avg Price</div>
                      <div className="text-sm font-semibold text-foreground">{market.avgPrice}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Per SqFt</div>
                      <div className="text-sm font-semibold text-foreground">{market.pricePerSqft}</div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="space-y-2 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Population
                      </div>
                      <span className="font-medium">{market.population}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        Employment
                      </div>
                      <span className="font-medium text-emerald-500">{market.employmentRate}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Rental Demand
                      </div>
                      <span className={`font-medium capitalize ${getRentalDemandColor(market.rentalDemand)}`}>
                        {market.rentalDemand}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        Investment Vol.
                      </div>
                      <span className="font-medium">{market.investmentVolume}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-muted-foreground">3M Change</div>
                      <span className="font-medium text-emerald-500">{market.priceChange3m}</span>
                    </div>
                  </div>

                  {/* Hover Effect Gradient */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom buffer */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/98 to-transparent pointer-events-none rounded-b-2xl" />
    </div>
  );
};

export default GrowingMarketsPanel;