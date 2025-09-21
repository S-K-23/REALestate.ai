import { Property } from '@/components/PropertyCard';

export const generateMockProperties = (location: string): Property[] => {
  const propertyTypes = ['Apartment', 'House', 'Condo', 'Townhouse', 'Loft'];
  const neighborhoods = ['Downtown', 'Riverside', 'Historic District', 'Uptown', 'Suburbs'];
  
  const properties: Property[] = [];
  
  for (let i = 0; i < 8; i++) {
    const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const bedrooms = Math.floor(Math.random() * 4) + 1;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    const basePrice = Math.floor(Math.random() * 800000) + 200000;
    
    properties.push({
      id: `prop-${i + 1}`,
      title: `Modern ${type} in ${neighborhood}`,
      price: `$${basePrice.toLocaleString()}`,
      location: `${neighborhood}, ${location}`,
      type,
      bedrooms,
      bathrooms,
      area: `${Math.floor(Math.random() * 2000) + 800} sq ft`,
      image: '', // Will use placeholder icon
      description: `Beautiful ${type.toLowerCase()} featuring modern amenities, updated kitchen, and spacious living areas. Perfect for ${bedrooms === 1 ? 'singles or couples' : 'families'}.`
    });
  }
  
  return properties;
};

export const generatePropertiesForLocation = (locationName: string, count: number = 8): Property[] => {
  const propertyTypes = ['Apartment', 'House', 'Condo', 'Townhouse', 'Loft', 'Studio', 'Duplex'];
  const amenities = [
    'Modern kitchen', 'Updated bathrooms', 'Hardwood floors', 'In-unit laundry',
    'Balcony', 'Parking included', 'Gym access', 'Pool access', 'Concierge',
    'Pet-friendly', 'Walking distance to transit', 'City views', 'Garden access'
  ];
  
  const properties: Property[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const bedrooms = type === 'Studio' ? 0 : Math.floor(Math.random() * 4) + 1;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    
    // More realistic pricing based on property type and size
    let basePrice = 150000;
    if (type === 'House') basePrice = 400000;
    else if (type === 'Condo') basePrice = 250000;
    else if (type === 'Loft') basePrice = 300000;
    else if (type === 'Studio') basePrice = 120000;
    
    const sizeMultiplier = bedrooms === 0 ? 0.7 : bedrooms * 0.8 + 0.4;
    const finalPrice = Math.floor(basePrice * sizeMultiplier * (0.8 + Math.random() * 0.8));
    
    const sqFt = type === 'Studio' 
      ? Math.floor(Math.random() * 400) + 300
      : Math.floor(Math.random() * 1500) + 500 + (bedrooms * 200);
    
    const selectedAmenities = amenities
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 2);
    
    properties.push({
      id: `prop-${Date.now()}-${i}`,
      title: `${type === 'Studio' ? 'Cozy Studio' : `${bedrooms}-Bed ${type}`} in ${locationName.split(',')[0]}`,
      price: `$${finalPrice.toLocaleString()}`,
      location: locationName,
      type,
      bedrooms,
      bathrooms,
      area: `${sqFt.toLocaleString()} sq ft`,
      image: '', // Will use placeholder icon
      description: `Beautiful ${type.toLowerCase()} featuring ${selectedAmenities.slice(0, 3).join(', ')}. ${
        bedrooms > 2 ? 'Perfect for families' : bedrooms === 1 ? 'Ideal for professionals' : 'Great for couples or singles'
      }.`
    });
  }
  
  return properties.sort((a, b) => {
    const aPrice = parseInt(a.price.replace(/[$,]/g, ''));
    const bPrice = parseInt(b.price.replace(/[$,]/g, ''));
    return aPrice - bPrice;
  });
};