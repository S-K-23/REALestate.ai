import React from 'react';
import { User, Settings, Filter, TrendingUp, MapPin, DollarSign, BarChart3, Users, Home, Building2, Target, ArrowUpRight, ArrowDownRight, Minus, Menu, X, Heart } from 'lucide-react';
import { useMatches } from '@/contexts/MatchesContext';

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
    name: 'Lisbon',
    country: 'Portugal',
    growth: '+9.7%',
    yield: '5.4%',
    trend: 'up',
    lat: 38.7223,
    lng: -9.1393,
    avgPrice: '€380K',
    pricePerSqft: '€3,200',
    population: '2.8M',
    employmentRate: '93.5%',
    investmentVolume: '€950M',
    rentalDemand: 'high',
    marketCap: '€18.5B',
    priceChange3m: '+6.8%'
  },
  {
    id: '4',
    name: 'Berlin',
    country: 'Germany',
    growth: '+8.1%',
    yield: '4.9%',
    trend: 'up',
    lat: 52.5200,
    lng: 13.4050,
    avgPrice: '€450K',
    pricePerSqft: '€4,100',
    population: '3.7M',
    employmentRate: '94.8%',
    investmentVolume: '€1.2B',
    rentalDemand: 'medium',
    marketCap: '€28.3B',
    priceChange3m: '+5.9%'
  },
  {
    id: '5',
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
  },
  {
    id: '6',
    name: 'Singapore',
    country: 'Singapore',
    growth: '+7.8%',
    yield: '3.2%',
    trend: 'up',
    lat: 1.3521,
    lng: 103.8198,
    avgPrice: 'S$1.2M',
    pricePerSqft: 'S$1,100',
    population: '5.9M',
    employmentRate: '97.8%',
    investmentVolume: 'S$3.2B',
    rentalDemand: 'high',
    marketCap: 'S$78.5B',
    priceChange3m: '+5.2%'
  },
  {
    id: '7',
    name: 'Amsterdam',
    country: 'Netherlands',
    growth: '+6.9%',
    yield: '4.1%',
    trend: 'up',
    lat: 52.3676,
    lng: 4.9041,
    avgPrice: '€425K',
    pricePerSqft: '€5,800',
    population: '2.4M',
    employmentRate: '96.7%',
    investmentVolume: '€1.8B',
    rentalDemand: 'high',
    marketCap: '€25.1B',
    priceChange3m: '+4.3%'
  },
  {
    id: '8',
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
    id: '9',
    name: 'Sydney',
    country: 'Australia',
    growth: '+5.3%',
    yield: '3.8%',
    trend: 'neutral',
    lat: -33.8688,
    lng: 151.2093,
    avgPrice: 'A$950K',
    pricePerSqft: 'A$7,200',
    population: '5.3M',
    employmentRate: '96.1%',
    investmentVolume: 'A$2.1B',
    rentalDemand: 'medium',
    marketCap: 'A$68.7B',
    priceChange3m: '+3.7%'
  },
  {
    id: '10',
    name: 'Tokyo',
    country: 'Japan',
    growth: '+4.2%',
    yield: '4.5%',
    trend: 'neutral',
    lat: 35.6762,
    lng: 139.6503,
    avgPrice: '¥65M',
    pricePerSqft: '¥850K',
    population: '14.0M',
    employmentRate: '97.2%',
    investmentVolume: '¥450B',
    rentalDemand: 'medium',
    marketCap: '¥890B',
    priceChange3m: '+2.8%'
  }
];

interface MarketsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onMarketSelect: (lat: number, lng: number) => void;
  onMatchesClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onFilterClick?: () => void;
  onLogout?: () => void;
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

const MarketsSidebar: React.FC<MarketsSidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onMarketSelect, 
  onMatchesClick,
  onProfileClick,
  onSettingsClick,
  onFilterClick,
  onLogout
}) => {
  const { matchesCount } = useMatches();
  
  const menuItems = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'filter', name: 'Filter', icon: Filter },
    { id: 'matches', name: 'Matches', icon: Heart, count: matchesCount },
    { id: 'logout', name: 'Logout', icon: X },
  ];

  const handleMenuItemClick = (itemId: string) => {
    switch (itemId) {
      case 'matches':
        if (onMatchesClick) onMatchesClick();
        break;
      case 'profile':
        if (onProfileClick) onProfileClick();
        break;
      case 'settings':
        if (onSettingsClick) onSettingsClick();
        break;
      case 'filter':
        if (onFilterClick) onFilterClick();
        break;
      case 'logout':
        if (onLogout) onLogout();
        break;
      default:
        console.log(`Navigate to ${itemId}`);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed top-4 left-4 z-[9999] w-60 
          transition-all duration-500 ease-in-out animate-fade-in
          bg-background/98 backdrop-blur-xl
          border border-border/60 rounded-2xl
          shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)]
          overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-accent/5 before:rounded-2xl before:pointer-events-none
        ">
          {/* Header */}
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 opacity-100 transition-opacity duration-300">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Menu className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Navigation</h2>
                  <p className="text-xs text-white/80">Explore features</p>
                </div>
              </div>
              
              {/* Always visible toggle button */}
              <button
                onClick={onToggle}
                className="p-2 rounded-lg bg-white hover:bg-white/90 transition-colors duration-200 shadow-lg flex-shrink-0"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className="group relative p-4 rounded-xl bg-white border border-border/30 hover:border-primary/20 hover:bg-white/90 transition-all duration-300 cursor-pointer hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        {item.id === 'matches' && item.count && item.count > 0 && (
                          <div className="bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                            {item.count}
                          </div>
                        )}
                      </div>
                        {item.id === 'profile' && (
                          <p className="text-xs text-muted-foreground">Manage your account</p>
                        )}
                        {item.id === 'settings' && (
                          <p className="text-xs text-muted-foreground">App preferences</p>
                        )}
                        {item.id === 'filter' && (
                          <p className="text-xs text-muted-foreground">Search criteria</p>
                        )}
                        {item.id === 'matches' && (
                          <p className="text-xs text-muted-foreground">
                            {item.count > 0 ? `${item.count} properties you loved` : 'Property matches'}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Hover Effect Gradient */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketsSidebar;