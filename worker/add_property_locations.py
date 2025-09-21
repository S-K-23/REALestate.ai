#!/usr/bin/env python3
"""
Add proper location data to properties based on their coordinates.
This includes city, state, and other location details.
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

def get_location_from_coordinates(lat, lng):
    """Get detailed location information based on coordinates."""
    
    # Major US cities with their coordinates and details
    locations = [
        # Florida
        {"lat_range": (25.5, 26.5), "lng_range": (-81.0, -79.5), "city": "Miami", "state": "FL", "region": "South Florida"},
        {"lat_range": (27.5, 28.5), "lng_range": (-83.0, -82.0), "city": "Tampa", "state": "FL", "region": "Central Florida"},
        {"lat_range": (28.5, 29.5), "lng_range": (-82.0, -81.0), "city": "Jacksonville", "state": "FL", "region": "North Florida"},
        {"lat_range": (28.0, 29.0), "lng_range": (-81.5, -80.5), "city": "Orlando", "state": "FL", "region": "Central Florida"},
        
        # New York
        {"lat_range": (40.5, 41.0), "lng_range": (-74.5, -73.5), "city": "New York", "state": "NY", "region": "New York Metro"},
        {"lat_range": (40.0, 41.0), "lng_range": (-74.0, -73.0), "city": "Brooklyn", "state": "NY", "region": "New York Metro"},
        {"lat_range": (40.5, 41.5), "lng_range": (-74.5, -73.5), "city": "Queens", "state": "NY", "region": "New York Metro"},
        
        # California
        {"lat_range": (33.5, 34.5), "lng_range": (-118.5, -117.5), "city": "Los Angeles", "state": "CA", "region": "Southern California"},
        {"lat_range": (37.5, 38.0), "lng_range": (-122.8, -122.0), "city": "San Francisco", "state": "CA", "region": "Bay Area"},
        {"lat_range": (32.5, 33.0), "lng_range": (-117.5, -116.8), "city": "San Diego", "state": "CA", "region": "Southern California"},
        {"lat_range": (33.5, 34.0), "lng_range": (-118.3, -118.0), "city": "Long Beach", "state": "CA", "region": "Southern California"},
        {"lat_range": (33.0, 34.0), "lng_range": (-117.5, -117.0), "city": "Anaheim", "state": "CA", "region": "Southern California"},
        {"lat_range": (36.5, 37.0), "lng_range": (-119.8, -119.5), "city": "Fresno", "state": "CA", "region": "Central California"},
        {"lat_range": (38.3, 38.8), "lng_range": (-121.5, -121.0), "city": "Sacramento", "state": "CA", "region": "Central California"},
        {"lat_range": (37.5, 38.5), "lng_range": (-122.5, -121.5), "city": "Oakland", "state": "CA", "region": "Bay Area"},
        {"lat_range": (37.0, 38.0), "lng_range": (-122.0, -121.0), "city": "San Jose", "state": "CA", "region": "Bay Area"},
        
        # Texas
        {"lat_range": (29.5, 30.0), "lng_range": (-95.5, -95.0), "city": "Houston", "state": "TX", "region": "East Texas"},
        {"lat_range": (32.5, 33.0), "lng_range": (-97.0, -96.5), "city": "Dallas", "state": "TX", "region": "North Texas"},
        {"lat_range": (32.5, 33.0), "lng_range": (-97.5, -97.0), "city": "Fort Worth", "state": "TX", "region": "North Texas"},
        {"lat_range": (29.2, 29.8), "lng_range": (-98.8, -98.2), "city": "San Antonio", "state": "TX", "region": "South Texas"},
        {"lat_range": (30.0, 30.5), "lng_range": (-97.8, -97.5), "city": "Austin", "state": "TX", "region": "Central Texas"},
        {"lat_range": (31.5, 32.0), "lng_range": (-106.8, -106.2), "city": "El Paso", "state": "TX", "region": "West Texas"},
        {"lat_range": (32.5, 33.0), "lng_range": (-98.0, -97.5), "city": "Arlington", "state": "TX", "region": "North Texas"},
        {"lat_range": (27.5, 28.5), "lng_range": (-97.5, -97.0), "city": "Corpus Christi", "state": "TX", "region": "South Texas"},
        
        # Illinois
        {"lat_range": (41.5, 42.0), "lng_range": (-87.8, -87.5), "city": "Chicago", "state": "IL", "region": "Chicagoland"},
        
        # Arizona
        {"lat_range": (33.0, 33.8), "lng_range": (-112.5, -111.5), "city": "Phoenix", "state": "AZ", "region": "Phoenix Metro"},
        {"lat_range": (32.0, 32.5), "lng_range": (-111.2, -110.8), "city": "Tucson", "state": "AZ", "region": "Southern Arizona"},
        {"lat_range": (33.2, 33.8), "lng_range": (-111.8, -111.5), "city": "Mesa", "state": "AZ", "region": "Phoenix Metro"},
        
        # Pennsylvania
        {"lat_range": (39.8, 40.2), "lng_range": (-75.5, -74.8), "city": "Philadelphia", "state": "PA", "region": "Philadelphia Metro"},
        
        # Ohio
        {"lat_range": (39.8, 40.2), "lng_range": (-83.2, -82.8), "city": "Columbus", "state": "OH", "region": "Central Ohio"},
        {"lat_range": (41.0, 42.0), "lng_range": (-82.0, -81.5), "city": "Cleveland", "state": "OH", "region": "Northeast Ohio"},
        
        # North Carolina
        {"lat_range": (35.0, 35.5), "lng_range": (-81.0, -80.5), "city": "Charlotte", "state": "NC", "region": "Piedmont"},
        {"lat_range": (35.5, 36.0), "lng_range": (-78.8, -78.5), "city": "Raleigh", "state": "NC", "region": "Piedmont"},
        
        # Georgia
        {"lat_range": (33.5, 34.0), "lng_range": (-84.5, -84.2), "city": "Atlanta", "state": "GA", "region": "Metro Atlanta"},
        
        # Washington
        {"lat_range": (47.3, 47.8), "lng_range": (-122.5, -122.0), "city": "Seattle", "state": "WA", "region": "Puget Sound"},
        
        # Colorado
        {"lat_range": (39.5, 40.0), "lng_range": (-105.2, -104.5), "city": "Denver", "state": "CO", "region": "Front Range"},
        {"lat_range": (38.5, 39.0), "lng_range": (-104.8, -104.5), "city": "Colorado Springs", "state": "CO", "region": "Front Range"},
        {"lat_range": (39.0, 40.0), "lng_range": (-105.0, -104.5), "city": "Aurora", "state": "CO", "region": "Front Range"},
        
        # Washington DC
        {"lat_range": (38.5, 39.2), "lng_range": (-77.2, -76.8), "city": "Washington", "state": "DC", "region": "DMV"},
        
        # Massachusetts
        {"lat_range": (42.2, 42.5), "lng_range": (-71.2, -70.8), "city": "Boston", "state": "MA", "region": "Greater Boston"},
        
        # Tennessee
        {"lat_range": (36.0, 36.5), "lng_range": (-87.0, -86.5), "city": "Nashville", "state": "TN", "region": "Middle Tennessee"},
        {"lat_range": (35.0, 35.5), "lng_range": (-90.2, -89.8), "city": "Memphis", "state": "TN", "region": "West Tennessee"},
        
        # Michigan
        {"lat_range": (42.0, 42.8), "lng_range": (-83.5, -82.8), "city": "Detroit", "state": "MI", "region": "Metro Detroit"},
        
        # Oklahoma
        {"lat_range": (35.2, 35.8), "lng_range": (-97.8, -97.2), "city": "Oklahoma City", "state": "OK", "region": "Central Oklahoma"},
        {"lat_range": (36.0, 36.5), "lng_range": (-96.0, -95.5), "city": "Tulsa", "state": "OK", "region": "Northeast Oklahoma"},
        
        # Oregon
        {"lat_range": (45.3, 45.8), "lng_range": (-122.8, -122.3), "city": "Portland", "state": "OR", "region": "Portland Metro"},
        
        # Nevada
        {"lat_range": (36.0, 36.5), "lng_range": (-115.5, -114.8), "city": "Las Vegas", "state": "NV", "region": "Las Vegas Valley"},
        
        # Kentucky
        {"lat_range": (38.0, 38.5), "lng_range": (-85.8, -85.5), "city": "Louisville", "state": "KY", "region": "Louisville Metro"},
        {"lat_range": (37.5, 38.5), "lng_range": (-84.5, -84.0), "city": "Lexington", "state": "KY", "region": "Bluegrass Region"},
        
        # Maryland
        {"lat_range": (39.0, 39.5), "lng_range": (-76.8, -76.2), "city": "Baltimore", "state": "MD", "region": "Baltimore Metro"},
        
        # Wisconsin
        {"lat_range": (42.8, 43.3), "lng_range": (-88.2, -87.8), "city": "Milwaukee", "state": "WI", "region": "Milwaukee Metro"},
        
        # New Mexico
        {"lat_range": (35.0, 35.3), "lng_range": (-106.8, -106.3), "city": "Albuquerque", "state": "NM", "region": "Albuquerque Metro"},
        
        # Missouri
        {"lat_range": (39.0, 39.3), "lng_range": (-94.8, -94.2), "city": "Kansas City", "state": "MO", "region": "Kansas City Metro"},
        
        # Indiana
        {"lat_range": (39.5, 40.0), "lng_range": (-86.5, -85.8), "city": "Indianapolis", "state": "IN", "region": "Central Indiana"},
        
        # Louisiana
        {"lat_range": (29.8, 30.2), "lng_range": (-90.2, -89.8), "city": "New Orleans", "state": "LA", "region": "Greater New Orleans"},
        
        # Kansas
        {"lat_range": (37.5, 38.0), "lng_range": (-97.5, -97.0), "city": "Wichita", "state": "KS", "region": "South Central Kansas"},
        
        # Nebraska
        {"lat_range": (41.0, 41.5), "lng_range": (-96.0, -95.5), "city": "Omaha", "state": "NE", "region": "Omaha Metro"},
        
        # Minnesota
        {"lat_range": (44.8, 45.2), "lng_range": (-93.5, -93.0), "city": "Minneapolis", "state": "MN", "region": "Twin Cities"},
        
        # Virginia
        {"lat_range": (36.5, 37.0), "lng_range": (-76.5, -76.0), "city": "Virginia Beach", "state": "VA", "region": "Hampton Roads"},
        
        # Hawaii
        {"lat_range": (21.0, 21.5), "lng_range": (-158.0, -157.5), "city": "Honolulu", "state": "HI", "region": "Oahu"},
        
        # Additional California cities
        {"lat_range": (35.0, 36.0), "lng_range": (-119.0, -118.5), "city": "Bakersfield", "state": "CA", "region": "Central California"},
        {"lat_range": (33.5, 34.5), "lng_range": (-117.5, -117.0), "city": "Riverside", "state": "CA", "region": "Inland Empire"},
        {"lat_range": (33.5, 34.0), "lng_range": (-118.0, -117.5), "city": "Santa Ana", "state": "CA", "region": "Orange County"},
    ]
    
    # Check each location
    for location in locations:
        lat_min, lat_max = location["lat_range"]
        lng_min, lng_max = location["lng_range"]
        
        if lat_min <= lat <= lat_max and lng_min <= lng <= lng_max:
            return {
                "city": location["city"],
                "state": location["state"],
                "region": location["region"],
                "country": "United States"
            }
    
    # If no specific location found, try to determine state
    state_info = get_state_from_coordinates(lat, lng)
    return {
        "city": "Unknown City",
        "state": state_info,
        "region": "Unknown Region",
        "country": "United States"
    }

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
    
    print("🔍 Fetching all properties with coordinates...")
    
    # Get all properties with coordinates
    response = supabase.table('property').select('*').not_.is_('latitude', None).not_.is_('longitude', None).execute()
    
    if not response.data:
        print("❌ No properties with coordinates found")
        return
    
    properties = response.data
    print(f"📊 Found {len(properties)} properties with coordinates")
    
    # Track updates
    updates_made = 0
    
    for property in properties:
        if property.get('latitude') and property.get('longitude'):
            lat = float(property['latitude'])
            lng = float(property['longitude'])
            
            # Get detailed location information
            location_info = get_location_from_coordinates(lat, lng)
            
            # Check if location needs to be updated
            current_city = property.get('city', '')
            current_state = property.get('state', '')
            
            if current_city != location_info['city'] or current_state != location_info['state']:
                print(f"🔄 Updating property {property['id']}:")
                print(f"   From: {current_city}, {current_state}")
                print(f"   To: {location_info['city']}, {location_info['state']} ({location_info['region']})")
                
                # Update the property with location information
                update_data = {
                    'city': location_info['city'],
                    'state': location_info['state']
                }
                
                # Optionally add region if you have a region column
                # update_data['region'] = location_info['region']
                
                update_response = supabase.table('property').update(update_data).eq('id', property['id']).execute()
                
                if update_response.data:
                    updates_made += 1
                    print(f"   ✅ Updated successfully")
                else:
                    print(f"   ❌ Update failed")
    
    print(f"\n🎉 Updated {updates_made} properties with correct location information")

if __name__ == "__main__":
    main()
