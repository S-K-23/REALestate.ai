// Reverse geocoding utility to get location names from coordinates
// Using a more comprehensive approach for better location detection

export interface LocationResult {
  city: string;
  country: string;
  region: string;
  displayName: string;
}

export const getLocationFromCoordinates = async (lat: number, lng: number): Promise<LocationResult> => {
  try {
    // Try multiple zoom levels to get the best city-level result
    // Start with zoom 14 for city-level, fall back to zoom 10 for county if needed
    const zoomLevels = [14, 12, 10];
    
    for (const zoom of zoomLevels) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=${zoom}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PropertyScout-App'
          }
        }
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      
      if (data && data.address && !data.error) {
        const address = data.address;
        
        // Prioritize actual cities/towns over counties/administrative areas
        const city = address.city || 
                    address.town || 
                    address.village || 
                    address.municipality ||
                    address.hamlet ||
                    address.neighbourhood ||
                    address.suburb ||
                    address.county ||
                    'Unknown Location';
                    
        const country = address.country || 'Unknown Country';
        const region = address.state || address.region || address.province || '';
        
        // Create a clean display name
        let displayName;
        if (region && country) {
          displayName = `${city}, ${region}, ${country}`;
        } else if (country) {
          displayName = `${city}, ${country}`;
        } else {
          displayName = city;
        }

        return {
          city,
          country,
          region,
          displayName
        };
      }
    }
  } catch (error) {
    console.error('Error getting location:', error);
  }

  // Fallback to coordinate-based detection
  return getLocationFromCoordinatesFallback(lat, lng);
};

// Fallback function for when the API is unavailable
const getLocationFromCoordinatesFallback = (lat: number, lng: number): LocationResult => {
  // Major cities and regions based on coordinates
  const locations = [
    { lat: [40.7, 40.8], lng: [-74.1, -73.9], city: 'New York', country: 'USA', region: 'NY' },
    { lat: [34.0, 34.1], lng: [-118.3, -118.2], city: 'Los Angeles', country: 'USA', region: 'CA' },
    { lat: [51.4, 51.6], lng: [-0.2, 0.1], city: 'London', country: 'UK', region: 'England' },
    { lat: [48.8, 48.9], lng: [2.2, 2.4], city: 'Paris', country: 'France', region: 'Île-de-France' },
    { lat: [35.6, 35.7], lng: [139.6, 139.8], city: 'Tokyo', country: 'Japan', region: 'Kantō' },
    { lat: [43.6, 43.8], lng: [-79.5, -79.2], city: 'Toronto', country: 'Canada', region: 'ON' },
    { lat: [-33.9, -33.8], lng: [151.1, 151.3], city: 'Sydney', country: 'Australia', region: 'NSW' },
    { lat: [-23.6, -23.4], lng: [-46.8, -46.5], city: 'São Paulo', country: 'Brazil', region: 'SP' },
    { lat: [52.4, 52.6], lng: [13.3, 13.5], city: 'Berlin', country: 'Germany', region: 'Berlin' },
    { lat: [55.7, 55.8], lng: [37.5, 37.7], city: 'Moscow', country: 'Russia', region: 'Moscow' },
  ];

  for (const loc of locations) {
    if (lat >= loc.lat[0] && lat <= loc.lat[1] && lng >= loc.lng[0] && lng <= loc.lng[1]) {
      return {
        city: loc.city,
        country: loc.country,
        region: loc.region,
        displayName: `${loc.city}, ${loc.region}, ${loc.country}`
      };
    }
  }

  // Continental fallbacks
  if (lat > 0) {
    if (lng > -30 && lng < 70) {
      return { city: 'European City', country: 'Europe', region: '', displayName: 'Europe' };
    } else if (lng > 70) {
      return { city: 'Asian City', country: 'Asia', region: '', displayName: 'Asia' };
    } else {
      return { city: 'North American City', country: 'North America', region: '', displayName: 'North America' };
    }
  } else {
    if (lng > 100) {
      return { city: 'Australian City', country: 'Australia', region: '', displayName: 'Australia/Oceania' };
    } else if (lng > -80) {
      return { city: 'African City', country: 'Africa', region: '', displayName: 'Africa' };
    } else {
      return { city: 'South American City', country: 'South America', region: '', displayName: 'South America' };
    }
  }
};