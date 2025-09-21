import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Pin {
  id: string;
  lat: number;
  lng: number;
  isInvestmentCity?: boolean;
  isMatch?: boolean;
}

interface RealWorldMapProps {
  onPinPlace: (lat: number, lng: number) => void;
  pins: Pin[];
  zoomToLocation?: { lat: number; lng: number; zoom?: number };
}

const RealWorldMap: React.FC<RealWorldMapProps> = ({ onPinPlace, pins, zoomToLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractingRef = useRef(false);
  const currentZoomRef = useRef(4); // Store current zoom level
  const lastClickTimeRef = useRef<number>(0);
  const pendingClickRef = useRef<boolean>(false);

  // Initialize Leaflet icon fix inside component
  const initializeLeafletIcons = useCallback(() => {
    // Only initialize once
    if ((L.Icon.Default.prototype as any)._getIconUrl) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiMwMDAiLz4KPGNpcmNsZSBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjQiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTEyLjUgMjVMMTIuNSA0MSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiMwMDAiLz4KPGNpcmNsZSBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjQiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTEyLjUgMjVMMTIuNSA0MSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',
        shadowUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA0MSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGVsbGlwc2UgY3g9IjIwLjUiIGN5PSIzNy41IiByeD0iMTgiIHJ5PSIzLjUiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4zIi8+Cjwvc3ZnPg==',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    }
  }, []);

  // Auto-rotation functionality with graceful smooth transitions
  const startRotation = useCallback(() => {
    if (rotationIntervalRef.current) return;
    
    rotationIntervalRef.current = setInterval(() => {
      if (!mapInstanceRef.current || userInteractingRef.current) return;
      
      try {
        const center = mapInstanceRef.current.getCenter();
        let newLng = center.lng + 0.5; // Slower, graceful speed
        
        // Handle world wrapping gracefully
        if (newLng > 180) {
          newLng = newLng - 360;
        }
        
        // Use setView with smoother easing for graceful rotation
        mapInstanceRef.current.setView([center.lat, newLng], mapInstanceRef.current.getZoom(), {
          animate: true,
          duration: 1.2, // Longer duration for smoother movement
          easeLinearity: 0.1, // Much smoother easing
        });
      } catch (error) {
        console.error('Rotation error:', error);
        stopRotation(); // Stop rotation if error occurs
      }
    }, 1200); // Longer interval for more graceful movement
  }, []);

  const stopRotation = useCallback(() => {
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet icons first
    initializeLeafletIcons();

    // Initialize map with higher zoom
    mapInstanceRef.current = L.map(mapRef.current, {
      center: [30, 0],
      zoom: 4, // Higher initial zoom
      zoomControl: false, // Remove zoom buttons
      scrollWheelZoom: true,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: true,
      touchZoom: true
    });

    // Store initial zoom
    currentZoomRef.current = 4;

    // Add CartoDB Positron tiles with English labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 18,
      className: 'map-tiles',
      subdomains: 'abcd'
    }).addTo(mapInstanceRef.current);

    // Track zoom changes
    mapInstanceRef.current.on('zoomend', () => {
      if (mapInstanceRef.current) {
        currentZoomRef.current = mapInstanceRef.current.getZoom();
      }
    });

    // Track user interaction to stop rotation - more responsive
    const handleUserInteractionStart = () => {
      userInteractingRef.current = true;
      stopRotation();
    };

    const handleUserInteractionEnd = () => {
      setTimeout(() => {
        if (!userInteractingRef.current) return; // Check if still supposed to be interacting
        userInteractingRef.current = false;
        startRotation();
      }, 5000); // 5 seconds wait before resuming auto-rotation
    };

    // Add interaction event listeners - more comprehensive
    mapInstanceRef.current.on('mousedown', handleUserInteractionStart);
    mapInstanceRef.current.on('dragstart', handleUserInteractionStart);
    mapInstanceRef.current.on('zoomstart', handleUserInteractionStart);
    mapInstanceRef.current.on('touchstart', handleUserInteractionStart);
    mapInstanceRef.current.on('wheel', handleUserInteractionStart); // Add wheel events
    
    mapInstanceRef.current.on('mouseup', handleUserInteractionEnd);
    mapInstanceRef.current.on('dragend', handleUserInteractionEnd);
    mapInstanceRef.current.on('zoomend', handleUserInteractionEnd);
    mapInstanceRef.current.on('touchend', handleUserInteractionEnd);

    // Click handler moved to separate effect

    // Start auto-rotation
    startRotation();

    // Cleanup
    return () => {
      stopRotation();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initializeLeafletIcons, startRotation, stopRotation]);

  // Click handler effect decoupled from map init
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const now = Date.now();
      // Debounce rapid clicks (500ms)
      if (now - lastClickTimeRef.current < 500 || pendingClickRef.current) {
        return;
      }
      lastClickTimeRef.current = now;
      pendingClickRef.current = true;
      // Stop rotation immediately when user clicks
      userInteractingRef.current = true;
      stopRotation();
      const { lat, lng } = e.latlng;
      console.log('Map clicked at:', lat, lng);
      onPinPlace(lat, lng);
      setTimeout(() => {
        pendingClickRef.current = false;
      }, 1000);
    };

    mapInstanceRef.current.on('click', handleMapClick);
    return () => {
      mapInstanceRef.current?.off('click', handleMapClick);
    };
  }, [onPinPlace, stopRotation]);

  // Update markers when pins prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers with different styles for investment cities, matches, and user pins
    pins.forEach(pin => {
      if (mapInstanceRef.current) {
        let marker: L.Marker;
        
        if (pin.isInvestmentCity) {
          // Create a custom icon for investment cities using light blue
          const investmentIcon = L.divIcon({
            className: 'investment-city-marker',
            html: `<div style="
              width: 20px; 
              height: 20px; 
              background: hsl(200 100% 70%); 
              border: 2px solid hsl(200 100% 60%); 
              border-radius: 50%; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          marker = L.marker([pin.lat, pin.lng], { icon: investmentIcon });
        } else if (pin.isMatch) {
          // Create a custom icon for matches using pink
          const matchIcon = L.divIcon({
            className: 'match-marker',
            html: `<div style="
              width: 18px; 
              height: 18px; 
              background: hsl(330 100% 70%); 
              border: 2px solid hsl(330 100% 60%); 
              border-radius: 50%; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: white;
              font-weight: bold;
            ">♥</div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });
          marker = L.marker([pin.lat, pin.lng], { icon: matchIcon });
        } else {
          // Use default marker for user-placed pins
          marker = L.marker([pin.lat, pin.lng]);
        }
        
        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      }
    });
  }, [pins]);

  // Handle zoom to location
  useEffect(() => {
    if (!mapInstanceRef.current || !zoomToLocation) return;
    
    // Stop rotation and user interaction flags
    userInteractingRef.current = true;
    stopRotation();
    
    // Zoom to the specified location with smooth animation
    mapInstanceRef.current.setView(
      [zoomToLocation.lat, zoomToLocation.lng], 
      zoomToLocation.zoom || 8, 
      {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.2
      }
    );
    
    // Resume rotation after zoom completes
    setTimeout(() => {
      userInteractingRef.current = false;
      startRotation();
    }, 3000);
  }, [zoomToLocation, stopRotation, startRotation]);

  return (
    <div className="w-full h-full relative bg-background border border-border">
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[400px] rounded-lg overflow-hidden leaflet-map-container bg-background"
      />
    </div>
  );
};

export default RealWorldMap;