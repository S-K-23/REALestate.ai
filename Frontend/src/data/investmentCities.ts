export interface InvestmentCity {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  description: string;
}

export const INVESTMENT_CITIES: InvestmentCity[] = [
  // Markets from sidebar (high-growth opportunities)
  { id: 'dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, description: 'Luxury real estate hub' },
  { id: 'austin', name: 'Austin', country: 'USA', lat: 30.2672, lng: -97.7431, description: 'Tech boom city' },
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, description: 'European growth market' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, description: 'Startup ecosystem' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, description: 'Growing tech hub' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, description: 'Gateway to Asia' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, description: 'Investment friendly' },
  { id: 'miami', name: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918, description: 'International gateway' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, description: 'Harbor city growth' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, description: 'Economic powerhouse' },
  
  // Additional global investment hotspots
  { id: 'london', name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, description: 'Global financial center' },
  { id: 'nyc', name: 'New York City', country: 'USA', lat: 40.7128, lng: -74.0060, description: 'Prime real estate market' },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, description: 'Cultural capital' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, description: 'Mediterranean hub' },
  { id: 'madrid', name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, description: 'Iberian gateway' },
  { id: 'milan', name: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.1900, description: 'Fashion & finance' },
  { id: 'zurich', name: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417, description: 'Financial hub' },
  { id: 'stockholm', name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, description: 'Nordic innovation' },
  { id: 'copenhagen', name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683, description: 'Sustainable city' },
  { id: 'vienna', name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, description: 'Central European hub' },
  
  // Asia Pacific expansion
  { id: 'hongkong', name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, description: 'International finance' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, description: 'Tech innovation' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, description: 'Southeast Asian hub' },
  { id: 'kualalumpur', name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869, description: 'Islamic finance center' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, description: 'Financial capital of India' },
  { id: 'bangalore', name: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, description: 'Silicon Valley of India' },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, description: 'Cultural hub' },
  
  // Americas expansion
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, description: 'Pacific gateway' },
  { id: 'montreal', name: 'Montreal', country: 'Canada', lat: 45.5017, lng: -73.5673, description: 'Cultural metropolis' },
  { id: 'seattle', name: 'Seattle', country: 'USA', lat: 47.6062, lng: -122.3321, description: 'Tech corridor' },
  { id: 'losangeles', name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, description: 'Entertainment capital' },
  { id: 'chicago', name: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, description: 'Midwest powerhouse' },
  { id: 'denver', name: 'Denver', country: 'USA', lat: 39.7392, lng: -104.9903, description: 'Mountain gateway' },
  { id: 'saopaulo', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, description: 'Economic center' },
  { id: 'buenosaires', name: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lng: -58.3960, description: 'South American hub' },
  { id: 'mexicocity', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, description: 'Latin American gateway' },
  
  // Middle East & Africa expansion
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, description: 'Vision 2030 hub' },
  { id: 'doha', name: 'Doha', country: 'Qatar', lat: 25.2854, lng: 51.5310, description: 'Gulf finance center' },
  { id: 'telaviv', name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818, description: 'Startup nation' },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, description: 'Bridge between continents' },
  { id: 'capetown', name: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241, description: 'African gateway' },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, description: 'East African hub' },
  { id: 'casablanca', name: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898, description: 'North African center' }
];