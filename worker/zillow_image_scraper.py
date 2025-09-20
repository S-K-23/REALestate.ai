#!/usr/bin/env python3
"""
Zillow Image Scraper
Scrapes real property images from Zillow and updates the database
"""

import os
import sys
import json
import time
import random
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Missing Supabase environment variables")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Headers to mimic a real browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

def get_zillow_images(property_address, city, state):
    """
    Scrape real images from Zillow for a specific property
    """
    try:
        # Construct Zillow search URL
        search_query = f"{property_address} {city} {state}".replace(" ", "+")
        zillow_search_url = f"https://www.zillow.com/homes/{search_query}_rb/"
        
        print(f"🔍 Searching Zillow for: {property_address}, {city}, {state}")
        
        # Add random delay to avoid rate limiting
        time.sleep(random.uniform(2, 4))
        
        # Make request to Zillow
        response = requests.get(zillow_search_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for property images in various Zillow selectors
        images = []
        
        # Try different Zillow image selectors
        image_selectors = [
            'img[data-testid="property-image"]',
            '.media-stream img',
            '.photo-item img',
            '.property-photo img',
            'img[alt*="property"]',
            'img[src*="photos"]'
        ]
        
        for selector in image_selectors:
            img_elements = soup.select(selector)
            for img in img_elements[:5]:  # Limit to first 5 images
                src = img.get('src') or img.get('data-src')
                if src:
                    # Convert relative URLs to absolute
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        src = 'https://www.zillow.com' + src
                    
                    # Filter out small or placeholder images
                    if any(size in src for size in ['_w_', '_h_', 'thumbnail']) or len(src) > 50:
                        images.append(src)
        
        # Remove duplicates while preserving order
        unique_images = list(dict.fromkeys(images))
        
        print(f"📸 Found {len(unique_images)} images for {property_address}")
        return unique_images[:8]  # Limit to 8 images max
        
    except Exception as e:
        print(f"❌ Error scraping images for {property_address}: {str(e)}")
        return []

def generate_realistic_placeholder_images(property_address, city, state, property_type, price):
    """
    Generate more realistic placeholder images based on property characteristics
    """
    # Create property-specific image URLs that look more realistic
    base_url = "https://images.unsplash.com/photo-"
    
    # Different photo IDs for different property types and price ranges
    if property_type == "single_family":
        if price > 1000000:
            photo_ids = [
                "1600596542815-ffad4c1539a9",  # Luxury house
                "1600566753190-17f0baa2a6c3",  # Modern house exterior
                "1600585154340-be6161a56a9c",  # House with garden
                "1600607687644-c7171b42498b",  # Contemporary house
                "1600607687939-ce8a6c25118c"   # Modern interior
            ]
        else:
            photo_ids = [
                "1600566753151-384129cf4e3e",  # Family house
                "1600607687920-4e2a09cf159d",  # Traditional house
                "1600585154340-be6161a56a9c",  # House exterior
                "1600607687644-c7171b42498b",  # House interior
                "1600607687939-ce8a6c25118c"   # Living room
            ]
    elif property_type == "condo":
        photo_ids = [
            "1600607687939-ce8a6c25118c",  # Modern condo
            "1600607687644-c7171b42498b",  # Condo interior
            "1600596542815-ffad4c1539a9",  # Condo exterior
            "1600566753190-17f0baa2a6c3",  # Condo building
            "1600585154340-be6161a56a9c"   # Condo view
        ]
    else:
        photo_ids = [
            "1600596542815-ffad4c1539a9",  # Generic property
            "1600566753190-17f0baa2a6c3",  # Property exterior
            "1600585154340-be6161a56a9c",  # Property view
            "1600607687644-c7171b42498b",  # Property interior
            "1600607687939-ce8a6c25118c"   # Living space
        ]
    
    # Generate URLs with proper sizing
    images = []
    for photo_id in photo_ids:
        url = f"{base_url}{photo_id}?w=800&h=600&fit=crop"
        images.append(url)
    
    return images

def update_property_images():
    """
    Update all properties in the database with real or realistic images
    """
    try:
        # Get all properties from the database
        response = supabase.table('property').select('id, address, city, state, property_type, price').execute()
        properties = response.data
        
        print(f"📋 Found {len(properties)} properties to update")
        
        updated_count = 0
        
        for i, property_data in enumerate(properties):
            property_id = property_data['id']
            address = property_data['address']
            city = property_data['city']
            state = property_data['state']
            property_type = property_data.get('property_type', 'single_family')
            price = property_data.get('price', 0)
            
            print(f"\n🏠 [{i+1}/{len(properties)}] Updating: {address}, {city}, {state}")
            
            # Try to get real Zillow images first
            real_images = get_zillow_images(address, city, state)
            
            if real_images:
                # Use real Zillow images
                images_to_use = real_images
                print(f"✅ Using {len(real_images)} real Zillow images")
            else:
                # Fallback to realistic placeholder images
                images_to_use = generate_realistic_placeholder_images(
                    address, city, state, property_type, price
                )
                print(f"🔄 Using realistic placeholder images")
            
            # Update the property in the database
            try:
                update_response = supabase.table('property').update({
                    'images': images_to_use
                }).eq('id', property_id).execute()
                
                if update_response.data:
                    updated_count += 1
                    print(f"✅ Updated property {property_id}")
                else:
                    print(f"❌ Failed to update property {property_id}")
                    
            except Exception as e:
                print(f"❌ Database error for {property_id}: {str(e)}")
            
            # Add delay between requests to be respectful
            time.sleep(random.uniform(1, 3))
        
        print(f"\n🎉 Successfully updated {updated_count}/{len(properties)} properties with images")
        
    except Exception as e:
        print(f"❌ Error updating property images: {str(e)}")

def main():
    """
    Main function to scrape and update property images
    """
    print("🚀 Starting Zillow Image Scraper")
    print("=" * 50)
    
    update_property_images()
    
    print("\n✅ Image scraping completed!")

if __name__ == "__main__":
    main()
