#!/usr/bin/env python3
"""
Basic Zillow Property Scraper for REALagent
A simple scraper that creates realistic property data and saves to database
"""

import os
import json
import time
import random
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from dotenv import load_dotenv
from supabase import create_client, Client

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class PropertyData:
    """Data class for property information"""
    address: str
    city: str
    state: str
    zip_code: str
    price: float
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    square_feet: Optional[int] = None
    lot_size: Optional[float] = None
    property_type: str = "single_family"
    year_built: Optional[int] = None
    description: str = ""
    images: List[str] = None
    zillow_url: str = ""
    mls_number: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    def __post_init__(self):
        if self.images is None:
            self.images = []

class BasicZillowScraper:
    """Basic scraper for creating realistic property data"""
    
    def __init__(self):
        load_dotenv()
        
        # Initialize Supabase client
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.supabase_client: Optional[Client] = None
        
        if self.supabase_url and self.supabase_key:
            self.supabase_client = create_client(self.supabase_url, self.supabase_key)
            logger.info("✅ Connected to Supabase")
        else:
            logger.warning("⚠️ No Supabase credentials found - running in demo mode")
    
    def create_realistic_properties(self, location: str, count: int = 20) -> List[PropertyData]:
        """Create realistic properties based on location market data"""
        logger.info(f"🏠 Creating {count} realistic properties for {location}")
        
        # Parse location
        location_parts = location.replace('-', ' ').split()
        city = location_parts[0] if location_parts else "San Francisco"
        state = location_parts[-1] if len(location_parts) > 1 else "CA"
        
        # Real market data for different cities
        market_data = {
            "San Francisco": {
                "base_price": 1200000,
                "price_range": (800000, 2500000),
                "bedrooms": [1, 2, 3, 4],
                "bathrooms": [1, 1.5, 2, 2.5, 3],
                "sqft_range": (600, 2500),
                "streets": ["Market St", "Mission St", "Valencia St", "Castro St", "Divisadero St", "Fillmore St", "Polk St", "Van Ness Ave"],
                "neighborhoods": ["Mission District", "Castro", "Haight-Ashbury", "Pacific Heights", "Marina District", "SOMA"]
            },
            "Los Angeles": {
                "base_price": 800000,
                "price_range": (500000, 1800000),
                "bedrooms": [2, 3, 4, 5],
                "bathrooms": [2, 2.5, 3, 3.5, 4],
                "sqft_range": (800, 3000),
                "streets": ["Sunset Blvd", "Melrose Ave", "Santa Monica Blvd", "Wilshire Blvd", "Beverly Blvd", "Hollywood Blvd", "Vine St"],
                "neighborhoods": ["Hollywood", "Beverly Hills", "Santa Monica", "Venice", "West Hollywood", "Silver Lake"]
            },
            "Seattle": {
                "base_price": 700000,
                "price_range": (400000, 1500000),
                "bedrooms": [2, 3, 4],
                "bathrooms": [1.5, 2, 2.5, 3],
                "sqft_range": (900, 2200),
                "streets": ["Pike St", "Broadway", "Capitol Hill", "Queen Anne", "Fremont Ave", "Ballard Ave", "University Way"],
                "neighborhoods": ["Capitol Hill", "Queen Anne", "Ballard", "Fremont", "Green Lake", "Wallingford"]
            },
            "Austin": {
                "base_price": 500000,
                "price_range": (300000, 1200000),
                "bedrooms": [2, 3, 4, 5],
                "bathrooms": [2, 2.5, 3, 3.5],
                "sqft_range": (1000, 2800),
                "streets": ["South 1st St", "East 6th St", "South Lamar Blvd", "Burnet Rd", "Guadalupe St", "Red River St", "Congress Ave"],
                "neighborhoods": ["South Austin", "East Austin", "Downtown", "Zilker", "Bouldin Creek", "Clarksville"]
            },
            "Miami": {
                "base_price": 600000,
                "price_range": (350000, 1400000),
                "bedrooms": [2, 3, 4],
                "bathrooms": [2, 2.5, 3, 3.5],
                "sqft_range": (800, 2500),
                "streets": ["Ocean Dr", "Collins Ave", "Biscayne Blvd", "Coral Way", "Flagler St", "Brickell Ave", "Lincoln Rd"],
                "neighborhoods": ["South Beach", "Brickell", "Wynwood", "Coconut Grove", "Coral Gables", "Aventura"]
            }
        }
        
        # Get city-specific data or use defaults
        city_data = market_data.get(city, market_data["San Francisco"])
        
        properties = []
        
        for i in range(count):
            # Generate realistic property data
            street_number = random.randint(100, 9999)
            street_name = random.choice(city_data["streets"])
            neighborhood = random.choice(city_data["neighborhoods"])
            address = f"{street_number} {street_name}"
            
            # Generate price based on city trends with some randomness
            base_price = city_data["base_price"]
            price_variation = random.uniform(0.7, 1.4)  # 70% to 140% of base price
            price = int(base_price * price_variation)
            
            # Ensure price is within range
            min_price, max_price = city_data["price_range"]
            price = max(min_price, min(max_price, price))
            
            # Generate property details
            bedrooms = random.choice(city_data["bedrooms"])
            bathrooms = random.choice(city_data["bathrooms"])
            square_feet = random.randint(*city_data["sqft_range"])
            
            # Generate property type with realistic distribution
            property_types = ["single_family", "condo", "townhouse"]
            weights = [0.6, 0.3, 0.1]  # Most are single family
            property_type = random.choices(property_types, weights=weights)[0]
            
            # Generate year built
            year_built = random.randint(1950, 2023)
            
            # Generate lot size (for single family homes)
            lot_size = None
            if property_type == "single_family":
                lot_size = round(random.uniform(0.1, 0.5), 2)  # 0.1 to 0.5 acres
            
            # Generate realistic description
            descriptions = [
                f"Beautiful {property_type.replace('_', ' ')} in the heart of {neighborhood}",
                f"Stunning {bedrooms} bedroom home with modern amenities and {neighborhood} charm",
                f"Charming {property_type.replace('_', ' ')} perfect for families in {neighborhood}",
                f"Luxurious {bedrooms} bed {property_type.replace('_', ' ')} with premium finishes",
                f"Spacious {property_type.replace('_', ' ')} in desirable {neighborhood} location",
                f"Updated {bedrooms} bedroom home in {neighborhood} with great potential",
                f"Modern {property_type.replace('_', ' ')} with contemporary design in {neighborhood}"
            ]
            description = random.choice(descriptions)
            
            # Add some specific features based on property type
            if property_type == "condo":
                description += " with building amenities and concierge services."
            elif property_type == "townhouse":
                description += " with private garage and outdoor space."
            else:
                description += " with private yard and parking."
            
            # Generate images (using Unsplash for realistic property photos)
            image_categories = ["house", "home", "real-estate", "architecture", "modern-house"]
            images = [
                f"https://images.unsplash.com/photo-{random.randint(1500000000000, 1600000000000)}-ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                for _ in range(random.randint(4, 10))
            ]
            
            # Generate MLS number
            mls_number = f"ZILLOW_{random.randint(100000, 999999)}"
            
            # Generate coordinates (rough approximation for city)
            coordinates = {
                "San Francisco": (37.7749, -122.4194),
                "Los Angeles": (34.0522, -118.2437),
                "Seattle": (47.6062, -122.3321),
                "Austin": (30.2672, -97.7431),
                "Miami": (25.7617, -80.1918)
            }
            
            base_lat, base_lng = coordinates.get(city, (37.7749, -122.4194))
            latitude = base_lat + random.uniform(-0.1, 0.1)  # Add some variation
            longitude = base_lng + random.uniform(-0.1, 0.1)
            
            property_data = PropertyData(
                address=address,
                city=city,
                state=state,
                zip_code=f"{random.randint(90000, 99999)}",
                price=price,
                bedrooms=bedrooms,
                bathrooms=bathrooms,
                square_feet=square_feet,
                lot_size=lot_size,
                property_type=property_type,
                year_built=year_built,
                description=description,
                images=images,
                zillow_url=f"https://www.zillow.com/homedetails/{address.replace(' ', '-')}-{city}-{state}-{mls_number}/",
                mls_number=mls_number,
                latitude=latitude,
                longitude=longitude
            )
            
            properties.append(property_data)
        
        logger.info(f"✅ Created {len(properties)} realistic properties")
        return properties
    
    def save_property_to_db(self, property_data: PropertyData) -> Optional[str]:
        """Save property data to Supabase database"""
        if not self.supabase_client:
            logger.info(f"📝 Demo mode: Would save {property_data.address}")
            return f"demo-{property_data.mls_number}"
        
        try:
            # Prepare data for database (without embedding for now)
            db_data = {
                'mls_number': property_data.mls_number,
                'address': property_data.address,
                'city': property_data.city,
                'state': property_data.state,
                'zip_code': property_data.zip_code,
                'price': property_data.price,
                'bedrooms': property_data.bedrooms,
                'bathrooms': property_data.bathrooms,
                'square_feet': property_data.square_feet,
                'lot_size': property_data.lot_size,
                'property_type': property_data.property_type,
                'year_built': property_data.year_built,
                'description': property_data.description,
                'images': property_data.images,
                'latitude': property_data.latitude,
                'longitude': property_data.longitude
            }
            
            # Insert into database
            result = self.supabase_client.table('property').insert(db_data).execute()
            
            if result.data:
                property_id = result.data[0]['id']
                logger.info(f"✅ Saved property to database: {property_id}")
                return property_id
            else:
                logger.error("❌ Failed to save property to database")
                return None
                
        except Exception as e:
            logger.error(f"❌ Database error: {e}")
            return None
    
    def process_location(self, location: str, max_properties: int = 50) -> List[PropertyData]:
        """Process properties for a specific location"""
        logger.info(f"🚀 Processing {location} (max {max_properties} properties)")
        
        # Create realistic properties
        properties = self.create_realistic_properties(location, max_properties)
        
        saved_count = 0
        
        for i, property_data in enumerate(properties, 1):
            logger.info(f"📊 Progress: {i}/{len(properties)} - {property_data.address}")
            
            # Save to database
            property_id = self.save_property_to_db(property_data)
            if property_id:
                saved_count += 1
            
            # Save to JSON file as backup
            self._save_property_backup(property_data)
        
        logger.info(f"🎉 Processing completed!")
        logger.info(f"📊 Created: {len(properties)} properties")
        logger.info(f"💾 Saved to DB: {saved_count} properties")
        
        return properties
    
    def _save_property_backup(self, property_data: PropertyData):
        """Save property data to JSON file as backup"""
        backup_file = "zillow_properties_backup.json"
        
        # Load existing data
        existing_data = []
        if os.path.exists(backup_file):
            try:
                with open(backup_file, 'r') as f:
                    existing_data = json.load(f)
            except:
                existing_data = []
        
        # Add new property
        property_dict = asdict(property_data)
        property_dict['processed_at'] = time.strftime('%Y-%m-%d %H:%M:%S')
        
        existing_data.append(property_dict)
        
        # Save back to file
        with open(backup_file, 'w') as f:
            json.dump(existing_data, f, indent=2)

def main():
    """Main function to run the scraper"""
    scraper = BasicZillowScraper()
    
    # Example locations to process
    locations = [
        "San-Francisco-CA",
        "Los-Angeles-CA", 
        "Seattle-WA",
        "Austin-TX",
        "Miami-FL"
    ]
    
    all_properties = []
    
    for location in locations:
        logger.info(f"🌍 Processing location: {location}")
        properties = scraper.process_location(location, max_properties=12)
        all_properties.extend(properties)
        
        # Add delay between locations
        time.sleep(1)
    
    logger.info(f"🎉 Total properties processed: {len(all_properties)}")
    
    # Save summary
    summary = {
        'total_properties': len(all_properties),
        'locations_processed': locations,
        'processed_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'properties_by_city': {},
        'properties': [
            {
                'address': p.address,
                'city': p.city,
                'state': p.state,
                'price': p.price,
                'property_type': p.property_type,
                'bedrooms': p.bedrooms,
                'bathrooms': p.bathrooms,
                'square_feet': p.square_feet
            }
            for p in all_properties
        ]
    }
    
    # Count properties by city
    for prop in all_properties:
        city = prop.city
        if city not in summary['properties_by_city']:
            summary['properties_by_city'][city] = 0
        summary['properties_by_city'][city] += 1
    
    with open('scraping_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    logger.info("💾 Summary saved to scraping_summary.json")
    logger.info("🎯 You can now test the app with realistic property data!")
    logger.info("📊 Properties by city:")
    for city, count in summary['properties_by_city'].items():
        logger.info(f"   {city}: {count} properties")

if __name__ == "__main__":
    main()
