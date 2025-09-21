#!/usr/bin/env python3
"""
Check what properties are actually in the Miami area.
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

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers."""
    import math
    R = 6371  # Radius of the Earth in kilometers
    dLat = (lat2 - lat1) * math.pi / 180
    dLon = (lon2 - lon1) * math.pi / 180
    a = (math.sin(dLat/2) * math.sin(dLat/2) +
         math.cos(lat1 * math.pi / 180) * math.cos(lat2 * math.pi / 180) * 
         math.sin(dLon/2) * math.sin(dLon/2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    return distance

def main():
    # Get Supabase credentials
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    # Create Supabase client
    supabase: Client = create_client(url, key)
    
    # Miami coordinates
    miami_lat = 25.7617
    miami_lng = -80.1918
    
    print(f"🔍 Looking for properties near Miami ({miami_lat}, {miami_lng})")
    
    # Get all properties with coordinates
    response = supabase.table('property').select('*').not_.is_('latitude', None).not_.is_('longitude', None).execute()
    
    if not response.data:
        print("❌ No properties with coordinates found")
        return
    
    properties = response.data
    print(f"📊 Found {len(properties)} properties with coordinates")
    
    # Calculate distances and filter properties within 100km of Miami
    miami_properties = []
    for property in properties:
        if property.get('latitude') and property.get('longitude'):
            lat = float(property['latitude'])
            lng = float(property['longitude'])
            distance = calculate_distance(miami_lat, miami_lng, lat, lng)
            
            if distance <= 100:  # Within 100km of Miami
                miami_properties.append({
                    'id': property['id'],
                    'address': property.get('address', 'No address'),
                    'city': property.get('city', 'Unknown'),
                    'state': property.get('state', 'Unknown'),
                    'latitude': lat,
                    'longitude': lng,
                    'distance_km': round(distance, 2)
                })
    
    # Sort by distance
    miami_properties.sort(key=lambda x: x['distance_km'])
    
    print(f"\n📍 Found {len(miami_properties)} properties within 100km of Miami:")
    for i, prop in enumerate(miami_properties[:20]):  # Show first 20
        print(f"{i+1:2d}. {prop['address']}, {prop['city']}, {prop['state']}")
        print(f"     Coordinates: ({prop['latitude']:.6f}, {prop['longitude']:.6f})")
        print(f"     Distance: {prop['distance_km']} km")
        print()
    
    if len(miami_properties) == 0:
        print("❌ No properties found within 100km of Miami!")
        print("\n🔍 Looking for properties with coordinates closest to Miami:")
        
        # Find the closest properties regardless of distance
        all_distances = []
        for property in properties:
            if property.get('latitude') and property.get('longitude'):
                lat = float(property['latitude'])
                lng = float(property['longitude'])
                distance = calculate_distance(miami_lat, miami_lng, lat, lng)
                all_distances.append({
                    'property': property,
                    'distance': distance
                })
        
        # Sort by distance
        all_distances.sort(key=lambda x: x['distance'])
        
        print("Top 10 closest properties to Miami:")
        for i, item in enumerate(all_distances[:10]):
            prop = item['property']
            distance = item['distance']
            print(f"{i+1:2d}. {prop.get('address', 'No address')}, {prop.get('city', 'Unknown')}, {prop.get('state', 'Unknown')}")
            print(f"     Coordinates: ({prop['latitude']:.6f}, {prop['longitude']:.6f})")
            print(f"     Distance: {distance:.2f} km")
            print()

if __name__ == "__main__":
    main()
