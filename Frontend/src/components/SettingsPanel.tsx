import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Settings, Bell, MapPin, DollarSign, Filter, Moon, Sun, Volume2, VolumeX } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [priceRange, setPriceRange] = useState([300000, 1000000]);
  const [radius, setRadius] = useState([50]);

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
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground">Settings</h3>
              <p className="text-muted-foreground text-sm">App preferences</p>
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
        {/* Notifications */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Get notified about new matches</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Email Updates</p>
                <p className="text-xs text-muted-foreground">Weekly market insights</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Search */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Location Services</p>
                <p className="text-xs text-muted-foreground">Use your location for better results</p>
              </div>
              <Switch
                checked={locationServices}
                onCheckedChange={setLocationServices}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Search Radius</p>
              <div className="px-3">
                <Slider
                  value={radius}
                  onValueChange={setRadius}
                  max={200}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10 km</span>
                  <span>{radius[0]} km</span>
                  <span>200 km</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Preferences */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Price Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Price Range</p>
              <div className="px-3">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={2000000}
                  min={100000}
                  step={50000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>${(priceRange[0] / 1000).toFixed(0)}K</span>
                  <span>${(priceRange[1] / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Sound Effects</p>
                <p className="text-xs text-muted-foreground">Play sounds for interactions</p>
              </div>
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-foreground border-border/30 hover:bg-background/50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
