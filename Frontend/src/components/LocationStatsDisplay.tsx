import React from 'react';
import { MapPin, DollarSign, Users, Building2, Target, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LocationStats } from '@/data/locationStats';

interface LocationStatsDisplayProps {
  locationStats: LocationStats;
}

const getTrendIcon = (trend: LocationStats['trend']) => {
  switch (trend) {
    case 'up':
      return <ArrowUpRight className="h-3 w-3 text-emerald-500" />;
    case 'down':
      return <ArrowDownRight className="h-3 w-3 text-red-500" />;
    default:
      return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
};

const getRentalDemandColor = (demand: LocationStats['rentalDemand']) => {
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

const LocationStatsDisplay: React.FC<LocationStatsDisplayProps> = ({ locationStats }) => {
  return (
    <div className="space-y-3 p-2">
      <div className="group relative p-4 rounded-xl bg-white/10 border border-border/30">
        {/* Market Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-white flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">
                {locationStats.name}
              </h3>
              <p className="text-xs text-muted-foreground">{locationStats.country}</p>
            </div>
          </div>
          {getTrendIcon(locationStats.trend)}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Growth (YoY)</div>
            <div className="text-sm font-semibold text-emerald-500">{locationStats.growth}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Yield</div>
            <div className="text-sm font-semibold text-foreground">{locationStats.yield}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Avg Price</div>
            <div className="text-sm font-semibold text-foreground">{locationStats.avgPrice}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Per SqFt</div>
            <div className="text-sm font-semibold text-foreground">{locationStats.pricePerSqft}</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-2 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              Population
            </div>
            <span className="font-medium">{locationStats.population}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Building2 className="h-3 w-3" />
              Employment
            </div>
            <span className="font-medium text-emerald-500">{locationStats.employmentRate}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Target className="h-3 w-3" />
              Rental Demand
            </div>
            <span className={`font-medium capitalize ${getRentalDemandColor(locationStats.rentalDemand)}`}>
              {locationStats.rentalDemand}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Investment Vol.
            </div>
            <span className="font-medium">{locationStats.investmentVolume}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="text-muted-foreground">3M Change</div>
            <span className="font-medium text-emerald-500">{locationStats.priceChange3m}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStatsDisplay;