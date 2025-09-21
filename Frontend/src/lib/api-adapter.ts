import { Property } from '@/components/PropertyCard';

// Backend property interface (from your database)
export interface BackendProperty {
  id: string;
  mls_number?: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size?: number;
  property_type: string;
  year_built?: number;
  description: string;
  images: string[];
  latitude?: number;
  longitude?: number;
  cap_rate?: number;
}

// Convert backend property format to Frontend format
export const adaptBackendProperty = (backendProperty: BackendProperty): Property => ({
  id: backendProperty.id,
  title: `${backendProperty.bedrooms}-Bed ${backendProperty.property_type?.replace('_', ' ')}`,
  price: `$${backendProperty.price?.toLocaleString()}`,
  location: `${backendProperty.city}, ${backendProperty.state}`,
  type: backendProperty.property_type?.replace('_', ' '),
  bedrooms: backendProperty.bedrooms,
  bathrooms: backendProperty.bathrooms,
  area: `${backendProperty.square_feet?.toLocaleString()} sq ft`,
  image: backendProperty.images?.[0] || '',
  description: backendProperty.description || `Beautiful ${backendProperty.property_type?.replace('_', ' ')} in ${backendProperty.city}.`,
  cap_rate: backendProperty.cap_rate,
  address: backendProperty.address,
  city: backendProperty.city,
  state: backendProperty.state,
  square_feet: backendProperty.square_feet
});

// API base URL - will be your Next.js backend
const API_BASE_URL = 'http://localhost:3000/api';

// User management
export const createUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error creating user:', error);
    // Fallback to a default user ID for demo purposes
    return { id: '550e8400-e29b-41d4-a716-446655440000' };
  }
};

// Property loading functions
export const loadPropertiesForLocation = async (lat: number, lng: number, radius: number = 50): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        radius: radius,
        limit: 50
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to load properties for location');
    }

    const data = await response.json();
    return data.properties?.map(adaptBackendProperty) || [];
  } catch (error) {
    console.error('Error loading properties for location:', error);
    return [];
  }
};

export const loadPropertiesForCity = async (cityName: string, limit: number = 20): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cities: [cityName],
        limit: limit
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to load properties for city');
    }

    const data = await response.json();
    return data.properties?.map(adaptBackendProperty) || [];
  } catch (error) {
    console.error('Error loading properties for city:', error);
    return [];
  }
};

export const loadRecommendedProperties = async (userId: string, limit: number = 20): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        limit: limit
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to load recommendations');
    }

    const data = await response.json();
    return data.recommendations?.map(adaptBackendProperty) || [];
  } catch (error) {
    console.error('Error loading recommendations:', error);
    return [];
  }
};

// Interaction functions
export const recordInteraction = async (userId: string, propertyId: string, interactionType: 'like' | 'skip' | 'superlike') => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        propertyId: propertyId,
        interactionType: interactionType
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // If it's a duplicate interaction error, that's okay - just continue
      if (errorData.error && errorData.error.includes('duplicate key value violates unique constraint')) {
        console.log('Interaction already exists, continuing...');
        return true;
      } else {
        throw new Error(errorData.error || 'Failed to record interaction');
      }
    }

    return true;
  } catch (error) {
    console.error('Error recording interaction:', error);
    return false;
  }
};

// Matches functions
export const loadMatches = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/matches?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load matches');
    }
    
    const data = await response.json();
    return {
      matches: data.matches?.map(adaptBackendProperty) || [],
      count: data.count || 0
    };
  } catch (error) {
    console.error('Error loading matches:', error);
    return { matches: [], count: 0 };
  }
};

export const removeMatch = async (interactionId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/matches`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interactionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove match');
    }

    return true;
  } catch (error) {
    console.error('Error removing match:', error);
    return false;
  }
};

// Property filtering
export const filterProperties = async (filters: {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  states?: string[];
  cities?: string[];
  propertyTypes?: string[];
  minYear?: number;
  maxYear?: number;
  minSqft?: number;
  maxSqft?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
}): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error('Failed to filter properties');
    }

    const data = await response.json();
    return data.properties?.map(adaptBackendProperty) || [];
  } catch (error) {
    console.error('Error filtering properties:', error);
    return [];
  }
};
