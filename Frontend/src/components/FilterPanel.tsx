import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, Home, Building2, DollarSign, MapPin, Bed, Bath, Square, Calendar, Star } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const [priceRange, setPriceRange] = useState([100000, 500000]);
  const [bedrooms, setBedrooms] = useState([1, 5]);
  const [bathrooms, setBathrooms] = useState([1, 4]);
  const [squareFeet, setSquareFeet] = useState([1000, 4000]);
  const [yearBuilt, setYearBuilt] = useState([1960, 2024]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(['single_family', 'condo', 'townhouse', 'multi_family']);
  const [capRate, setCapRate] = useState([3, 12]);
  const [selectedStates, setSelectedStates] = useState<string[]>(['CA', 'TX', 'FL', 'NY', 'WA', 'CO']);
  const [searchRadius, setSearchRadius] = useState(500);

  const propertyTypeOptions = [
    { id: 'single_family', label: 'Single Family', icon: Home },
    { id: 'condo', label: 'Condo', icon: Building2 },
    { id: 'townhouse', label: 'Townhouse', icon: Building2 },
    { id: 'multi_family', label: 'Multi-Family', icon: Building2 },
  ];

  const stateOptions = [
    { id: 'CA', label: 'California' },
    { id: 'TX', label: 'Texas' },
    { id: 'FL', label: 'Florida' },
    { id: 'NY', label: 'New York' },
    { id: 'WA', label: 'Washington' },
    { id: 'CO', label: 'Colorado' },
  ];

  const handlePropertyTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setPropertyTypes([...propertyTypes, typeId]);
    } else {
      setPropertyTypes(propertyTypes.filter(id => id !== typeId));
    }
  };

  const handleStateChange = (stateId: string, checked: boolean) => {
    if (checked) {
      setSelectedStates([...selectedStates, stateId]);
    } else {
      setSelectedStates(selectedStates.filter(id => id !== stateId));
    }
  };

  const handleApplyFilters = () => {
    const filters = {
      priceRange,
      bedrooms,
      bathrooms,
      squareFeet,
      yearBuilt,
      propertyTypes,
      capRate,
      states: selectedStates,
      searchRadius,
    };
    
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    onClose();
  };

  const handleResetFilters = () => {
    setPriceRange([100000, 500000]);
    setBedrooms([1, 5]);
    setBathrooms([1, 4]);
    setSquareFeet([1000, 4000]);
    setYearBuilt([1960, 2024]);
    setPropertyTypes(['single_family', 'condo', 'townhouse', 'multi_family']);
    setCapRate([3, 12]);
    setSelectedStates(['CA', 'TX', 'FL', 'NY', 'WA', 'CO']);
    setSearchRadius(500);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-4 left-4 w-96 max-h-[80vh] bg-background/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] border border-border/60 z-[10000] overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-accent/5 before:rounded-2xl before:pointer-events-none
      transition-all duration-500 ease-in-out animate-fade-in">
      
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground">Search Filters</h3>
              <p className="text-muted-foreground text-sm">Refine your property search</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-background/50 h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto relative">
        {/* Price Range */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Price Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="px-3">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={600000}
                min={50000}
                step={25000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>${(priceRange[0] / 1000).toFixed(0)}K</span>
                <span>${(priceRange[1] / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Radius */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Search Radius
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="px-3">
              <Slider
                value={[searchRadius]}
                onValueChange={(value) => setSearchRadius(value[0])}
                max={1000}
                min={10}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>10 km</span>
                <span className="font-medium">{searchRadius} km</span>
                <span>1000 km</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Type */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypeOptions.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={propertyTypes.includes(type.id)}
                      onCheckedChange={(checked) => handlePropertyTypeChange(type.id, checked as boolean)}
                    />
                    <label
                      htmlFor={type.id}
                      className="text-sm font-medium text-foreground flex items-center gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bedrooms & Bathrooms */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Bedrooms & Bathrooms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Bedrooms</p>
              <div className="px-3">
                <Slider
                  value={bedrooms}
                  onValueChange={setBedrooms}
                  max={6}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{bedrooms[0]}</span>
                  <span>{bedrooms[1]}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Bathrooms</p>
              <div className="px-3">
                <Slider
                  value={bathrooms}
                  onValueChange={setBathrooms}
                  max={5}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{bathrooms[0]}</span>
                  <span>{bathrooms[1]}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Square Feet */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Square className="h-5 w-5" />
              Square Feet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="px-3">
              <Slider
                value={squareFeet}
                onValueChange={setSquareFeet}
                max={5000}
                min={500}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{squareFeet[0].toLocaleString()} sq ft</span>
                <span>{squareFeet[1].toLocaleString()} sq ft</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Criteria */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Star className="h-5 w-5" />
              Investment Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Cap Rate (%)</p>
              <div className="px-3">
                <Slider
                  value={capRate}
                  onValueChange={setCapRate}
                  max={15}
                  min={2}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{capRate[0]}%</span>
                  <span>{capRate[1]}%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Year Built</p>
              <div className="px-3">
                <Slider
                  value={yearBuilt}
                  onValueChange={setYearBuilt}
                  max={2024}
                  min={1900}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{yearBuilt[0]}</span>
                  <span>{yearBuilt[1]}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* States */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              States
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {stateOptions.map((state) => (
                <div key={state.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={state.id}
                    checked={selectedStates.includes(state.id)}
                    onCheckedChange={(checked) => handleStateChange(state.id, checked as boolean)}
                  />
                  <label
                    htmlFor={state.id}
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    {state.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full justify-start text-foreground border-border/30 hover:bg-background/50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Reset All Filters
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
