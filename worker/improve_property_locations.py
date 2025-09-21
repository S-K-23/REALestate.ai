#!/usr/bin/env python3
"""
Improve location data for properties with more comprehensive city detection.
"""

import os
import sys
import json
from supabase import create_client, Client

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from .env.local
def load_env_file():
    env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_env_file()

def get_city_from_coordinates(lat, lng):
    """Get city name from coordinates using a more comprehensive approach."""
    
    # Major US cities with broader coordinate ranges
    cities = [
        # Florida - Expanded ranges
        {"lat_range": (24.0, 26.8), "lng_range": (-82.0, -79.0), "city": "Miami", "state": "FL"},
        {"lat_range": (26.8, 28.8), "lng_range": (-83.5, -81.5), "city": "Tampa", "state": "FL"},
        {"lat_range": (28.8, 30.8), "lng_range": (-82.5, -80.5), "city": "Jacksonville", "state": "FL"},
        {"lat_range": (27.5, 29.5), "lng_range": (-82.0, -80.0), "city": "Orlando", "state": "FL"},
        {"lat_range": (26.0, 28.0), "lng_range": (-82.0, -80.0), "city": "Fort Myers", "state": "FL"},
        {"lat_range": (25.0, 27.0), "lng_range": (-81.0, -79.0), "city": "Fort Lauderdale", "state": "FL"},
        {"lat_range": (24.5, 26.5), "lng_range": (-81.5, -79.5), "city": "Key West", "state": "FL"},
        
        # California - Expanded ranges
        {"lat_range": (33.0, 35.0), "lng_range": (-119.0, -117.0), "city": "Los Angeles", "state": "CA"},
        {"lat_range": (37.0, 39.0), "lng_range": (-123.0, -121.5), "city": "San Francisco", "state": "CA"},
        {"lat_range": (32.0, 34.0), "lng_range": (-118.0, -116.5), "city": "San Diego", "state": "CA"},
        {"lat_range": (37.5, 39.5), "lng_range": (-122.0, -121.0), "city": "Oakland", "state": "CA"},
        {"lat_range": (36.5, 38.5), "lng_range": (-122.0, -120.5), "city": "Sacramento", "state": "CA"},
        {"lat_range": (37.0, 39.0), "lng_range": (-122.5, -121.0), "city": "San Jose", "state": "CA"},
        {"lat_range": (34.0, 36.0), "lng_range": (-120.0, -118.0), "city": "Bakersfield", "state": "CA"},
        {"lat_range": (33.0, 35.0), "lng_range": (-118.0, -116.5), "city": "Long Beach", "state": "CA"},
        {"lat_range": (33.5, 35.5), "lng_range": (-118.5, -117.0), "city": "Anaheim", "state": "CA"},
        {"lat_range": (33.0, 35.0), "lng_range": (-117.5, -116.5), "city": "Riverside", "state": "CA"},
        {"lat_range": (33.5, 35.5), "lng_range": (-118.0, -117.0), "city": "Santa Ana", "state": "CA"},
        
        # Texas - Expanded ranges
        {"lat_range": (29.0, 31.0), "lng_range": (-96.0, -94.5), "city": "Houston", "state": "TX"},
        {"lat_range": (32.0, 34.0), "lng_range": (-97.5, -96.0), "city": "Dallas", "state": "TX"},
        {"lat_range": (32.0, 34.0), "lng_range": (-98.0, -96.5), "city": "Fort Worth", "state": "TX"},
        {"lat_range": (28.5, 30.5), "lng_range": (-99.0, -98.0), "city": "San Antonio", "state": "TX"},
        {"lat_range": (29.5, 31.5), "lng_range": (-98.5, -97.0), "city": "Austin", "state": "TX"},
        {"lat_range": (31.0, 32.5), "lng_range": (-107.0, -106.0), "city": "El Paso", "state": "TX"},
        {"lat_range": (32.0, 33.5), "lng_range": (-98.5, -97.0), "city": "Arlington", "state": "TX"},
        {"lat_range": (27.0, 29.0), "lng_range": (-98.0, -97.0), "city": "Corpus Christi", "state": "TX"},
        {"lat_range": (29.0, 31.0), "lng_range": (-96.5, -95.0), "city": "Galveston", "state": "TX"},
        {"lat_range": (30.0, 32.0), "lng_range": (-96.0, -94.0), "city": "Beaumont", "state": "TX"},
        
        # New York - Expanded ranges
        {"lat_range": (40.0, 42.0), "lng_range": (-75.0, -73.0), "city": "New York", "state": "NY"},
        {"lat_range": (40.0, 42.0), "lng_range": (-74.5, -73.0), "city": "Brooklyn", "state": "NY"},
        {"lat_range": (40.0, 42.0), "lng_range": (-74.5, -73.0), "city": "Queens", "state": "NY"},
        {"lat_range": (40.0, 42.0), "lng_range": (-74.5, -73.0), "city": "Bronx", "state": "NY"},
        {"lat_range": (40.0, 42.0), "lng_range": (-74.5, -73.0), "city": "Staten Island", "state": "NY"},
        {"lat_range": (42.0, 44.0), "lng_range": (-79.0, -77.0), "city": "Buffalo", "state": "NY"},
        {"lat_range": (42.0, 44.0), "lng_range": (-78.0, -76.0), "city": "Rochester", "state": "NY"},
        {"lat_range": (42.0, 44.0), "lng_range": (-77.0, -75.0), "city": "Syracuse", "state": "NY"},
        
        # Illinois
        {"lat_range": (41.0, 42.5), "lng_range": (-88.5, -87.0), "city": "Chicago", "state": "IL"},
        {"lat_range": (39.0, 41.0), "lng_range": (-90.0, -88.0), "city": "Springfield", "state": "IL"},
        
        # Arizona
        {"lat_range": (32.5, 34.5), "lng_range": (-113.0, -111.0), "city": "Phoenix", "state": "AZ"},
        {"lat_range": (31.5, 33.0), "lng_range": (-111.5, -110.5), "city": "Tucson", "state": "AZ"},
        {"lat_range": (32.5, 34.0), "lng_range": (-112.0, -111.0), "city": "Mesa", "state": "AZ"},
        {"lat_range": (33.0, 34.5), "lng_range": (-112.5, -111.5), "city": "Scottsdale", "state": "AZ"},
        
        # Pennsylvania
        {"lat_range": (39.5, 40.5), "lng_range": (-76.0, -74.5), "city": "Philadelphia", "state": "PA"},
        {"lat_range": (40.0, 41.0), "lng_range": (-80.5, -79.0), "city": "Pittsburgh", "state": "PA"},
        
        # Ohio
        {"lat_range": (39.0, 41.0), "lng_range": (-84.0, -82.0), "city": "Columbus", "state": "OH"},
        {"lat_range": (40.5, 42.0), "lng_range": (-82.5, -81.0), "city": "Cleveland", "state": "OH"},
        {"lat_range": (39.0, 41.0), "lng_range": (-85.0, -83.0), "city": "Cincinnati", "state": "OH"},
        
        # North Carolina
        {"lat_range": (34.5, 36.0), "lng_range": (-81.5, -80.0), "city": "Charlotte", "state": "NC"},
        {"lat_range": (35.0, 36.5), "lng_range": (-79.5, -78.0), "city": "Raleigh", "state": "NC"},
        {"lat_range": (35.0, 36.5), "lng_range": (-79.5, -78.0), "city": "Durham", "state": "NC"},
        {"lat_range": (35.0, 36.0), "lng_range": (-80.5, -79.5), "city": "Winston-Salem", "state": "NC"},
        
        # Georgia
        {"lat_range": (33.0, 34.5), "lng_range": (-85.0, -83.5), "city": "Atlanta", "state": "GA"},
        {"lat_range": (31.5, 33.0), "lng_range": (-81.5, -80.5), "city": "Savannah", "state": "GA"},
        
        # Washington
        {"lat_range": (47.0, 48.5), "lng_range": (-123.0, -121.5), "city": "Seattle", "state": "WA"},
        {"lat_range": (46.5, 48.0), "lng_range": (-118.5, -117.0), "city": "Spokane", "state": "WA"},
        
        # Colorado
        {"lat_range": (39.0, 40.5), "lng_range": (-105.5, -104.0), "city": "Denver", "state": "CO"},
        {"lat_range": (38.0, 39.5), "lng_range": (-105.0, -104.0), "city": "Colorado Springs", "state": "CO"},
        {"lat_range": (39.5, 40.5), "lng_range": (-105.5, -104.5), "city": "Aurora", "state": "CO"},
        
        # Washington DC
        {"lat_range": (38.0, 39.5), "lng_range": (-77.5, -76.5), "city": "Washington", "state": "DC"},
        
        # Massachusetts
        {"lat_range": (42.0, 43.0), "lng_range": (-71.5, -70.5), "city": "Boston", "state": "MA"},
        {"lat_range": (42.0, 43.0), "lng_range": (-71.5, -70.5), "city": "Cambridge", "state": "MA"},
        
        # Tennessee
        {"lat_range": (35.5, 36.5), "lng_range": (-87.5, -86.0), "city": "Nashville", "state": "TN"},
        {"lat_range": (34.5, 35.5), "lng_range": (-90.5, -89.5), "city": "Memphis", "state": "TN"},
        {"lat_range": (35.0, 36.0), "lng_range": (-85.0, -84.0), "city": "Chattanooga", "state": "TN"},
        
        # Michigan
        {"lat_range": (41.5, 43.0), "lng_range": (-84.0, -82.5), "city": "Detroit", "state": "MI"},
        {"lat_range": (42.0, 43.0), "lng_range": (-84.0, -82.5), "city": "Grand Rapids", "state": "MI"},
        
        # Oklahoma
        {"lat_range": (34.5, 36.0), "lng_range": (-98.5, -97.0), "city": "Oklahoma City", "state": "OK"},
        {"lat_range": (35.5, 36.5), "lng_range": (-96.5, -95.0), "city": "Tulsa", "state": "OK"},
        
        # Oregon
        {"lat_range": (45.0, 46.0), "lng_range": (-123.0, -122.0), "city": "Portland", "state": "OR"},
        {"lat_range": (44.0, 45.0), "lng_range": (-124.0, -122.5), "city": "Eugene", "state": "OR"},
        
        # Nevada
        {"lat_range": (35.5, 36.5), "lng_range": (-115.5, -114.5), "city": "Las Vegas", "state": "NV"},
        {"lat_range": (39.0, 40.0), "lng_range": (-120.0, -119.0), "city": "Reno", "state": "NV"},
        
        # Kentucky
        {"lat_range": (37.5, 39.0), "lng_range": (-86.0, -85.0), "city": "Louisville", "state": "KY"},
        {"lat_range": (37.0, 38.5), "lng_range": (-85.0, -84.0), "city": "Lexington", "state": "KY"},
        
        # Maryland
        {"lat_range": (38.5, 39.5), "lng_range": (-77.5, -76.0), "city": "Baltimore", "state": "MD"},
        
        # Wisconsin
        {"lat_range": (42.5, 43.5), "lng_range": (-88.5, -87.5), "city": "Milwaukee", "state": "WI"},
        {"lat_range": (43.0, 44.0), "lng_range": (-90.0, -89.0), "city": "Madison", "state": "WI"},
        
        # New Mexico
        {"lat_range": (34.5, 35.5), "lng_range": (-107.0, -106.0), "city": "Albuquerque", "state": "NM"},
        {"lat_range": (35.0, 36.0), "lng_range": (-106.5, -105.5), "city": "Santa Fe", "state": "NM"},
        
        # Missouri
        {"lat_range": (38.5, 39.5), "lng_range": (-95.0, -93.5), "city": "Kansas City", "state": "MO"},
        {"lat_range": (38.0, 39.0), "lng_range": (-91.0, -90.0), "city": "St. Louis", "state": "MO"},
        
        # Indiana
        {"lat_range": (39.0, 40.5), "lng_range": (-87.0, -85.5), "city": "Indianapolis", "state": "IN"},
        {"lat_range": (41.0, 42.0), "lng_range": (-87.5, -86.5), "city": "Gary", "state": "IN"},
        
        # Louisiana
        {"lat_range": (29.5, 30.5), "lng_range": (-90.5, -89.5), "city": "New Orleans", "state": "LA"},
        {"lat_range": (30.0, 31.0), "lng_range": (-92.0, -91.0), "city": "Baton Rouge", "state": "LA"},
        
        # Kansas
        {"lat_range": (37.0, 38.5), "lng_range": (-98.0, -96.5), "city": "Wichita", "state": "KS"},
        {"lat_range": (38.5, 39.5), "lng_range": (-95.5, -94.5), "city": "Kansas City", "state": "KS"},
        
        # Nebraska
        {"lat_range": (40.5, 41.5), "lng_range": (-96.5, -95.5), "city": "Omaha", "state": "NE"},
        {"lat_range": (40.0, 41.0), "lng_range": (-97.0, -96.0), "city": "Lincoln", "state": "NE"},
        
        # Minnesota
        {"lat_range": (44.5, 45.5), "lng_range": (-93.5, -92.5), "city": "Minneapolis", "state": "MN"},
        {"lat_range": (44.5, 45.5), "lng_range": (-93.5, -92.5), "city": "St. Paul", "state": "MN"},
        
        # Virginia
        {"lat_range": (36.0, 37.5), "lng_range": (-77.0, -75.5), "city": "Virginia Beach", "state": "VA"},
        {"lat_range": (37.0, 38.0), "lng_range": (-78.5, -77.5), "city": "Richmond", "state": "VA"},
        
        # Hawaii
        {"lat_range": (21.0, 21.5), "lng_range": (-158.5, -157.5), "city": "Honolulu", "state": "HI"},
        
        # Additional major cities
        {"lat_range": (41.0, 42.0), "lng_range": (-88.0, -87.0), "city": "Aurora", "state": "IL"},
        {"lat_range": (40.0, 41.0), "lng_range": (-75.0, -74.0), "city": "Newark", "state": "NJ"},
        {"lat_range": (40.0, 41.0), "lng_range": (-74.5, -73.5), "city": "Jersey City", "state": "NJ"},
        {"lat_range": (39.0, 40.0), "lng_range": (-76.5, -75.5), "city": "Wilmington", "state": "DE"},
        {"lat_range": (38.0, 39.0), "lng_range": (-77.5, -76.5), "city": "Alexandria", "state": "VA"},
        {"lat_range": (38.0, 39.0), "lng_range": (-77.5, -76.5), "city": "Arlington", "state": "VA"},
    ]
    
    # Check each city
    for city in cities:
        lat_min, lat_max = city["lat_range"]
        lng_min, lng_max = city["lng_range"]
        
        if lat_min <= lat <= lat_max and lng_min <= lng <= lng_max:
            return city["city"], city["state"]
    
    # If no specific city found, determine state and use generic city name
    state = get_state_from_coordinates(lat, lng)
    return f"City in {state}", state

def get_state_from_coordinates(lat, lng):
    """Get state from coordinates as fallback."""
    # Major state boundaries (simplified)
    if 24.0 <= lat <= 31.0 and -87.0 <= lng <= -80.0:
        return "FL"
    elif 40.0 <= lat <= 45.0 and -79.0 <= lng <= -71.0:
        return "NY"
    elif 32.0 <= lat <= 42.0 and -124.0 <= lng <= -114.0:
        return "CA"
    elif 25.0 <= lat <= 37.0 and -106.0 <= lng <= -93.0:
        return "TX"
    elif 36.0 <= lat <= 43.0 and -91.0 <= lng <= -87.0:
        return "IL"
    elif 31.0 <= lat <= 37.0 and -115.0 <= lng <= -109.0:
        return "AZ"
    elif 39.0 <= lat <= 43.0 and -80.0 <= lng <= -74.0:
        return "PA"
    elif 38.0 <= lat <= 42.0 and -84.0 <= lng <= -80.0:
        return "OH"
    elif 33.0 <= lat <= 37.0 and -84.0 <= lng <= -75.0:
        return "NC"
    elif 30.0 <= lat <= 35.0 and -85.0 <= lng <= -80.0:
        return "GA"
    elif 45.0 <= lat <= 49.0 and -124.0 <= lng <= -116.0:
        return "WA"
    elif 37.0 <= lat <= 41.0 and -109.0 <= lng <= -102.0:
        return "CO"
    elif 38.0 <= lat <= 40.0 and -79.0 <= lng <= -75.0:
        return "DC"
    elif 41.0 <= lat <= 43.0 and -73.0 <= lng <= -69.0:
        return "MA"
    elif 35.0 <= lat <= 37.0 and -90.0 <= lng <= -81.0:
        return "TN"
    elif 41.0 <= lat <= 48.0 and -90.0 <= lng <= -82.0:
        return "MI"
    elif 33.0 <= lat <= 37.0 and -103.0 <= lng <= -94.0:
        return "OK"
    elif 42.0 <= lat <= 46.0 and -125.0 <= lng <= -116.0:
        return "OR"
    elif 35.0 <= lat <= 42.0 and -120.0 <= lng <= -114.0:
        return "NV"
    elif 36.0 <= lat <= 39.0 and -89.0 <= lng <= -81.0:
        return "KY"
    elif 38.0 <= lat <= 40.0 and -79.0 <= lng <= -75.0:
        return "MD"
    elif 42.0 <= lat <= 47.0 and -93.0 <= lng <= -86.0:
        return "WI"
    elif 31.0 <= lat <= 37.0 and -109.0 <= lng <= -103.0:
        return "NM"
    elif 36.0 <= lat <= 41.0 and -96.0 <= lng <= -89.0:
        return "MO"
    elif 37.0 <= lat <= 42.0 and -88.0 <= lng <= -84.0:
        return "IN"
    elif 28.0 <= lat <= 33.0 and -94.0 <= lng <= -88.0:
        return "LA"
    elif 37.0 <= lat <= 40.0 and -102.0 <= lng <= -94.0:
        return "KS"
    elif 40.0 <= lat <= 43.0 and -104.0 <= lng <= -95.0:
        return "NE"
    elif 43.0 <= lat <= 49.0 and -97.0 <= lng <= -89.0:
        return "MN"
    elif 36.0 <= lat <= 40.0 and -83.0 <= lng <= -75.0:
        return "VA"
    elif 18.0 <= lat <= 22.0 and -162.0 <= lng <= -154.0:
        return "HI"
    else:
        return "XX"

def main():
    # Get Supabase credentials
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    # Create Supabase client
    supabase: Client = create_client(url, key)
    
    print("🔍 Fetching properties with 'Unknown City' locations...")
    
    # Get properties with "Unknown City" or "XX" state
    response = supabase.table('property').select('*').or_('city.eq.Unknown City,city.eq.Unknown City,state.eq.XX').execute()
    
    if not response.data:
        print("❌ No properties with unknown locations found")
        return
    
    properties = response.data
    print(f"📊 Found {len(properties)} properties with unknown locations")
    
    # Track updates
    updates_made = 0
    
    for property in properties:
        if property.get('latitude') and property.get('longitude'):
            lat = float(property['latitude'])
            lng = float(property['longitude'])
            
            # Get improved location information
            city, state = get_city_from_coordinates(lat, lng)
            
            # Check if location needs to be updated
            current_city = property.get('city', '')
            current_state = property.get('state', '')
            
            if current_city != city or current_state != state:
                print(f"🔄 Updating property {property['id']}:")
                print(f"   From: {current_city}, {current_state}")
                print(f"   To: {city}, {state}")
                
                # Update the property with location information
                update_data = {
                    'city': city,
                    'state': state
                }
                
                update_response = supabase.table('property').update(update_data).eq('id', property['id']).execute()
                
                if update_response.data:
                    updates_made += 1
                    print(f"   ✅ Updated successfully")
                else:
                    print(f"   ❌ Update failed")
    
    print(f"\n🎉 Updated {updates_made} properties with improved location information")

if __name__ == "__main__":
    main()
