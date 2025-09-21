import React, { useState } from 'react';

interface Pin {
  id: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
}

interface WorldMapProps {
  onPinPlace: (pin: Pin) => void;
  pins: Pin[];
}

const WorldMap: React.FC<WorldMapProps> = ({ onPinPlace, pins }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const handleMapClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert SVG coordinates to approximate lat/lng (simplified projection)
    const lat = 90 - (y / rect.height) * 180;
    const lng = (x / rect.width) * 360 - 180;
    
    const newPin: Pin = {
      id: Date.now().toString(),
      x,
      y,
      lat,
      lng
    };
    
    onPinPlace(newPin);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-map-water">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full cursor-crosshair"
        onClick={handleMapClick}
      >
        {/* Simplified world map with all continents */}
        
        {/* North America */}
        <path
          d="M150 120 L120 100 L100 120 L80 140 L90 180 L120 200 L160 190 L180 160 L200 140 L220 120 L200 100 L180 80 L160 90 Z"
          fill="hsl(var(--map-land))"
          stroke="hsl(var(--map-border))"
          strokeWidth="1"
          className="transition-colors duration-200 hover:fill-accent"
          onMouseEnter={() => setHoveredCountry('North America')}
          onMouseLeave={() => setHoveredCountry(null)}
        />
        
        {/* South America */}
        <path
          d="M180 220 L160 240 L150 280 L160 320 L180 340 L200 350 L220 330 L210 290 L200 250 L190 230 Z"
          fill="hsl(var(--map-land))"
          stroke="hsl(var(--map-border))"
          strokeWidth="1"
          className="transition-colors duration-200 hover:fill-accent"
          onMouseEnter={() => setHoveredCountry('South America')}
          onMouseLeave={() => setHoveredCountry(null)}
        />
        
        {/* Europe */}
        <path
          d="M400 120 L380 110 L390 130 L420 140 L450 130 L440 110 L420 100 L410 110 Z"
          fill="hsl(var(--map-land))"
          stroke="hsl(var(--map-border))"
          strokeWidth="1"
          className="transition-colors duration-200 hover:fill-accent"
          onMouseEnter={() => setHoveredCountry('Europe')}
          onMouseLeave={() => setHoveredCountry(null)}
        />
        
        {/* Africa */}
        <path
          d="M420 180 L400 160 L410 200 L430 250 L450 280 L470 260 L460 220 L450 190 L440 170 Z"
          fill="hsl(var(--map-land))"
          stroke="hsl(var(--map-border))"
          strokeWidth="1"
          className="transition-colors duration-200 hover:fill-accent"
          onMouseEnter={() => setHoveredCountry('Africa')}
          onMouseLeave={() => setHoveredCountry(null)}
        />
        
        {/* Asia */}
        <path
          d="M500 100 L480 80 L520 90 L600 100 L650 120 L680 140 L700 160 L680 180 L650 170 L600 150 L550 140 L520 130 Z"
          fill="hsl(var(--map-land))"
          stroke="hsl(var(--map-border))"
          strokeWidth="1"
          className="transition-colors duration-200 hover:fill-accent"
          onMouseEnter={() => setHoveredCountry('Asia')}
          onMouseLeave={() => setHoveredCountry(null)}
        />
        
        {/* Australia */}
        <path
          d="M700 300 L680 290 L690 310 L720 320 L740 310 L730 295 L720 290 Z"
          fill="hsl(var(--map-land))"
          stroke="hsl(var(--map-border))"
          strokeWidth="1"
          className="transition-colors duration-200 hover:fill-accent"
          onMouseEnter={() => setHoveredCountry('Australia')}
          onMouseLeave={() => setHoveredCountry(null)}
        />
        
        {/* Antarctica */}
        <path
          d="M200 450 L800 450 L820 430 L800 410 L200 410 L180 430 Z"
          fill="hsl(var(--map-land))"
          stroke="hsl(var(--map-border))"
          strokeWidth="1"
          className="transition-colors duration-200 hover:fill-accent"
          onMouseEnter={() => setHoveredCountry('Antarctica')}
          onMouseLeave={() => setHoveredCountry(null)}
        />
        
        {/* Pins */}
        {pins.map((pin) => (
          <g key={pin.id}>
            <circle
              cx={pin.x}
              cy={pin.y}
              r="8"
              fill="hsl(var(--pin-color))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
              className="animate-smooth-scale"
            />
            <circle
              cx={pin.x}
              cy={pin.y}
              r="3"
              fill="hsl(var(--background))"
            />
          </g>
        ))}
        
        {/* Hover tooltip */}
        {hoveredCountry && (
          <text
            x="500"
            y="30"
            textAnchor="middle"
            className="text-sm fill-foreground"
          >
            {hoveredCountry}
          </text>
        )}
      </svg>
    </div>
  );
};

export default WorldMap;