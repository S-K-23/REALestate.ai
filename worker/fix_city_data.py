#!/usr/bin/env python3
"""
Fix city data in the database based on actual coordinates.
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
    """Get the correct city name based on coordinates."""
    # Miami area
    if 25.5 <= lat <= 25.9 and -80.5 <= lng <= -80.0:
        return "Miami", "FL"
    
    # New York area
    elif 40.5 <= lat <= 41.0 and -74.5 <= lng <= -73.5:
        return "New York", "NY"
    
    # Los Angeles area
    elif 33.5 <= lat <= 34.5 and -118.5 <= lng <= -117.5:
        return "Los Angeles", "CA"
    
    # Chicago area
    elif 41.5 <= lat <= 42.0 and -87.8 <= lng <= -87.5:
        return "Chicago", "IL"
    
    # Houston area
    elif 29.5 <= lat <= 30.0 and -95.5 <= lng <= -95.0:
        return "Houston", "TX"
    
    # Phoenix area
    elif 33.0 <= lat <= 33.8 and -112.5 <= lng <= -111.5:
        return "Phoenix", "AZ"
    
    # Philadelphia area
    elif 39.8 <= lat <= 40.2 and -75.5 <= lng <= -74.8:
        return "Philadelphia", "PA"
    
    # San Antonio area
    elif 29.2 <= lat <= 29.8 and -98.8 <= lng <= -98.2:
        return "San Antonio", "TX"
    
    # San Diego area
    elif 32.5 <= lat <= 33.0 and -117.5 <= lng <= -116.8:
        return "San Diego", "CA"
    
    # Dallas area
    elif 32.5 <= lat <= 33.0 and -97.0 <= lng <= -96.5:
        return "Dallas", "TX"
    
    # Austin area
    elif 30.0 <= lat <= 30.5 and -97.8 <= lng <= -97.5:
        return "Austin", "TX"
    
    # Jacksonville area
    elif 30.0 <= lat <= 30.5 and -81.8 <= lng <= -81.5:
        return "Jacksonville", "FL"
    
    # Fort Worth area
    elif 32.5 <= lat <= 33.0 and -97.5 <= lng <= -97.0:
        return "Fort Worth", "TX"
    
    # Columbus area
    elif 39.8 <= lat <= 40.2 and -83.2 <= lng <= -82.8:
        return "Columbus", "OH"
    
    # Charlotte area
    elif 35.0 <= lat <= 35.5 and -81.0 <= lng <= -80.5:
        return "Charlotte", "NC"
    
    # San Francisco area
    elif 37.5 <= lat <= 38.0 and -122.8 <= lng <= -122.0:
        return "San Francisco", "CA"
    
    # Indianapolis area
    elif 39.5 <= lat <= 40.0 and -86.5 <= lng <= -85.8:
        return "Indianapolis", "IN"
    
    # Seattle area
    elif 47.3 <= lat <= 47.8 and -122.5 <= lng <= -122.0:
        return "Seattle", "WA"
    
    # Denver area
    elif 39.5 <= lat <= 40.0 and -105.2 <= lng <= -104.5:
        return "Denver", "CO"
    
    # Washington DC area
    elif 38.5 <= lat <= 39.2 and -77.2 <= lng <= -76.8:
        return "Washington", "DC"
    
    # Boston area
    elif 42.2 <= lat <= 42.5 and -71.2 <= lng <= -70.8:
        return "Boston", "MA"
    
    # El Paso area
    elif 31.5 <= lat <= 32.0 and -106.8 <= lng <= -106.2:
        return "El Paso", "TX"
    
    # Nashville area
    elif 36.0 <= lat <= 36.5 and -87.0 <= lng <= -86.5:
        return "Nashville", "TN"
    
    # Detroit area
    elif 42.0 <= lat <= 42.8 and -83.5 <= lng <= -82.8:
        return "Detroit", "MI"
    
    # Oklahoma City area
    elif 35.2 <= lat <= 35.8 and -97.8 <= lng <= -97.2:
        return "Oklahoma City", "OK"
    
    # Portland area
    elif 45.3 <= lat <= 45.8 and -122.8 <= lng <= -122.3:
        return "Portland", "OR"
    
    # Las Vegas area
    elif 36.0 <= lat <= 36.5 and -115.5 <= lng <= -114.8:
        return "Las Vegas", "NV"
    
    # Memphis area
    elif 35.0 <= lat <= 35.5 and -90.2 <= lng <= -89.8:
        return "Memphis", "TN"
    
    # Louisville area
    elif 38.0 <= lat <= 38.5 and -85.8 <= lng <= -85.5:
        return "Louisville", "KY"
    
    # Baltimore area
    elif 39.0 <= lat <= 39.5 and -76.8 <= lng <= -76.2:
        return "Baltimore", "MD"
    
    # Milwaukee area
    elif 42.8 <= lat <= 43.3 and -88.2 <= lng <= -87.8:
        return "Milwaukee", "WI"
    
    # Albuquerque area
    elif 35.0 <= lat <= 35.3 and -106.8 <= lng <= -106.3:
        return "Albuquerque", "NM"
    
    # Tucson area
    elif 32.0 <= lat <= 32.5 and -111.2 <= lng <= -110.8:
        return "Tucson", "AZ"
    
    # Fresno area
    elif 36.5 <= lat <= 37.0 and -119.8 <= lng <= -119.5:
        return "Fresno", "CA"
    
    # Sacramento area
    elif 38.3 <= lat <= 38.8 and -121.5 <= lng <= -121.0:
        return "Sacramento", "CA"
    
    # Mesa area
    elif 33.2 <= lat <= 33.8 and -111.8 <= lng <= -111.5:
        return "Mesa", "AZ"
    
    # Kansas City area
    elif 39.0 <= lat <= 39.3 and -94.8 <= lng <= -94.2:
        return "Kansas City", "MO"
    
    # Atlanta area
    elif 33.5 <= lat <= 34.0 and -84.5 <= lng <= -84.2:
        return "Atlanta", "GA"
    
    # Long Beach area
    elif 33.5 <= lat <= 34.0 and -118.3 <= lng <= -118.0:
        return "Long Beach", "CA"
    
    # Colorado Springs area
    elif 38.5 <= lat <= 39.0 and -104.8 <= lng <= -104.5:
        return "Colorado Springs", "CO"
    
    # Raleigh area
    elif 35.5 <= lat <= 36.0 and -78.8 <= lng <= -78.5:
        return "Raleigh", "NC"
    
    # Miami area (broader)
    elif 25.0 <= lat <= 26.5 and -81.0 <= lng <= -79.5:
        return "Miami", "FL"
    
    # Default fallback
    else:
        return "Unknown City", "XX"

def main():
    # Get Supabase credentials
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        print(f"URL: {url}")
        print(f"Key: {'Present' if key else 'Missing'}")
        return
    
    # Create Supabase client
    supabase: Client = create_client(url, key)
    
    print("🔍 Fetching all properties...")
    
    # Get all properties
    response = supabase.table('property').select('*').execute()
    
    if not response.data:
        print("❌ No properties found")
        return
    
    properties = response.data
    print(f"📊 Found {len(properties)} properties")
    
    # Track updates
    updates_made = 0
    
    for property in properties:
        if property.get('latitude') and property.get('longitude'):
            lat = float(property['latitude'])
            lng = float(property['longitude'])
            
            # Get correct city and state
            correct_city, correct_state = get_city_from_coordinates(lat, lng)
            
            # Check if city needs to be updated
            current_city = property.get('city', '')
            current_state = property.get('state', '')
            
            if current_city != correct_city or current_state != correct_state:
                print(f"🔄 Updating property {property['id']}:")
                print(f"   From: {current_city}, {current_state}")
                print(f"   To: {correct_city}, {correct_state}")
                
                # Update the property
                update_response = supabase.table('property').update({
                    'city': correct_city,
                    'state': correct_state
                }).eq('id', property['id']).execute()
                
                if update_response.data:
                    updates_made += 1
                    print(f"   ✅ Updated successfully")
                else:
                    print(f"   ❌ Update failed")
    
    print(f"\n🎉 Updated {updates_made} properties with correct city information")

if __name__ == "__main__":
    main()
