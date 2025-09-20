#!/usr/bin/env python3
"""
Zillow Property Scraper for REALagent
Scrapes real property data from Zillow and inserts into Supabase database
"""

import os
import json
import time
import random
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse, parse_qs
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
import numpy as np

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

class ZillowScraper:
    """Main scraper class for Zillow properties"""
    
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
        
        # Initialize embedding model
        try:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("✅ Loaded embedding model")
        except Exception as e:
            logger.error(f"❌ Failed to load embedding model: {e}")
            self.embedding_model = None
        
        # HTTP session with headers to mimic a real browser
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        # Rate limiting
        self.request_delay = (1, 3)  # Random delay between 1-3 seconds
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Implement rate limiting to be respectful to Zillow"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        min_delay = self.request_delay[0]
        
        if time_since_last < min_delay:
            sleep_time = min_delay - time_since_last + random.uniform(0, 1)
            logger.info(f"⏳ Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def _make_request(self, url: str) -> Optional[BeautifulSoup]:
        """Make a rate-limited request to Zillow"""
        self._rate_limit()
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            return soup
            
        except requests.RequestException as e:
            logger.error(f"❌ Request failed for {url}: {e}")
            return None
    
    def search_properties(self, location: str, max_pages: int = 3) -> List[str]:
        """Search for properties and return property URLs"""
        logger.info(f"🔍 Searching for properties in {location}")
        
        property_urls = []
        
        for page in range(1, max_pages + 1):
            # Zillow search URL format
            search_url = f"https://www.zillow.com/homes/{location}_rb/"
            
            if page > 1:
                search_url += f"{page}_p/"
            
            logger.info(f"📄 Scraping page {page}: {search_url}")
            
            soup = self._make_request(search_url)
            if not soup:
                continue
            
            # Find property links on the page
            property_links = soup.find_all('a', {'data-test': 'property-card-link'})
            
            if not property_links:
                # Try alternative selector
                property_links = soup.find_all('a', href=lambda x: x and '/homedetails/' in x)
            
            for link in property_links:
                href = link.get('href')
                if href and '/homedetails/' in href:
                    full_url = urljoin('https://www.zillow.com', href)
                    property_urls.append(full_url)
            
            logger.info(f"📊 Found {len(property_links)} properties on page {page}")
            
            # If no properties found, we might have hit the end
            if not property_links:
                logger.info("📄 No more properties found, stopping search")
                break
        
        logger.info(f"🎯 Total property URLs found: {len(property_urls)}")
        return property_urls
    
    def scrape_property_details(self, url: str) -> Optional[PropertyData]:
        """Scrape detailed information from a single property page"""
        logger.info(f"🏠 Scraping property: {url}")
        
        soup = self._make_request(url)
        if not soup:
            return None
        
        try:
            # Extract property details using various selectors
            property_data = self._extract_property_info(soup, url)
            
            if property_data:
                logger.info(f"✅ Successfully scraped: {property_data.address}")
                return property_data
            else:
                logger.warning(f"⚠️ Could not extract property data from {url}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error scraping {url}: {e}")
            return None
    
    def _extract_property_info(self, soup: BeautifulSoup, url: str) -> Optional[PropertyData]:
        """Extract property information from the parsed HTML"""
        
        # Extract address
        address_element = soup.find('h1', {'data-test': 'property-address'})
        if not address_element:
            address_element = soup.find('h1', class_='ds-address-container')
        
        if not address_element:
            logger.warning("Could not find address")
            return None
        
        address_text = address_element.get_text(strip=True)
        
        # Parse address components
        address_parts = address_text.split(',')
        if len(address_parts) < 2:
            logger.warning(f"Could not parse address: {address_text}")
            return None
        
        street_address = address_parts[0].strip()
        city_state_zip = address_parts[1].strip()
        
        # Parse city, state, zip
        city_state_parts = city_state_zip.split()
        if len(city_state_parts) < 2:
            logger.warning(f"Could not parse city/state: {city_state_zip}")
            return None
        
        state = city_state_parts[-2] if len(city_state_parts) > 2 else city_state_parts[-1]
        zip_code = city_state_parts[-1] if len(city_state_parts) > 2 else ""
        city = " ".join(city_state_parts[:-2]) if len(city_state_parts) > 2 else city_state_parts[0]
        
        # Extract price
        price_element = soup.find('span', {'data-test': 'property-price'})
        if not price_element:
            price_element = soup.find('span', class_='ds-price')
        
        price = 0
        if price_element:
            price_text = price_element.get_text(strip=True)
            # Remove common price formatting
            price_text = price_text.replace('$', '').replace(',', '').replace('+', '')
            try:
                price = float(price_text)
            except ValueError:
                logger.warning(f"Could not parse price: {price_text}")
        
        # Extract property details
        details = soup.find('div', {'data-test': 'property-details'})
        if not details:
            details = soup.find('div', class_='ds-bed-bath-living-area')
        
        bedrooms = None
        bathrooms = None
        square_feet = None
        
        if details:
            detail_text = details.get_text()
            
            # Extract bedrooms
            import re
            bed_match = re.search(r'(\d+)\s*bed', detail_text, re.IGNORECASE)
            if bed_match:
                bedrooms = int(bed_match.group(1))
            
            # Extract bathrooms
            bath_match = re.search(r'(\d+(?:\.\d+)?)\s*bath', detail_text, re.IGNORECASE)
            if bath_match:
                bathrooms = float(bath_match.group(1))
            
            # Extract square feet
            sqft_match = re.search(r'(\d+(?:,\d+)?)\s*(?:sq\s*ft|sqft)', detail_text, re.IGNORECASE)
            if sqft_match:
                square_feet = int(sqft_match.group(1).replace(',', ''))
        
        # Extract description
        description_element = soup.find('div', {'data-test': 'property-description'})
        if not description_element:
            description_element = soup.find('div', class_='ds-overview-section')
        
        description = ""
        if description_element:
            description = description_element.get_text(strip=True)
        
        # Extract images
        images = []
        img_elements = soup.find_all('img', {'data-test': 'property-image'})
        if not img_elements:
            img_elements = soup.find_all('img', class_='ds-photo-item')
        
        for img in img_elements[:5]:  # Limit to 5 images
            src = img.get('src') or img.get('data-src')
            if src and src.startswith('http'):
                images.append(src)
        
        # Determine property type based on description or other indicators
        property_type = "single_family"
        if "condo" in description.lower() or "condominium" in description.lower():
            property_type = "condo"
        elif "townhouse" in description.lower() or "townhouse" in description.lower():
            property_type = "townhouse"
        elif "multi" in description.lower() or "duplex" in description.lower():
            property_type = "multi_family"
        
        # Generate MLS number from URL
        mls_number = url.split('/')[-2] if '/' in url else f"ZILLOW_{hash(url) % 100000}"
        
        return PropertyData(
            address=street_address,
            city=city,
            state=state,
            zip_code=zip_code,
            price=price,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            square_feet=square_feet,
            property_type=property_type,
            description=description,
            images=images,
            zillow_url=url,
            mls_number=mls_number
        )
    
    def generate_embedding(self, property_data: PropertyData) -> List[float]:
        """Generate embedding for property data"""
        if not self.embedding_model:
            return []
        
        # Create a comprehensive description for embedding
        description_parts = [
            f"{property_data.address} in {property_data.city}, {property_data.state}",
            property_data.description,
            f"{property_data.bedrooms} bedrooms, {property_data.bathrooms} bathrooms" if property_data.bedrooms and property_data.bathrooms else "",
            f"{property_data.square_feet} square feet" if property_data.square_feet else "",
            property_data.property_type.replace('_', ' ')
        ]
        
        full_description = " ".join(filter(None, description_parts))
        
        try:
            embedding = self.embedding_model.encode(full_description)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"❌ Error generating embedding: {e}")
            return []
    
    def save_property_to_db(self, property_data: PropertyData) -> Optional[str]:
        """Save property data to Supabase database"""
        if not self.supabase_client:
            logger.info("📝 Demo mode: Would save to database")
            return f"demo-{property_data.mls_number}"
        
        try:
            # Generate embedding
            embedding = self.generate_embedding(property_data)
            
            # Prepare data for database
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
                'property_embedding': embedding
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
    
    def scrape_location(self, location: str, max_properties: int = 50) -> List[PropertyData]:
        """Scrape properties from a specific location"""
        logger.info(f"🚀 Starting scrape for {location} (max {max_properties} properties)")
        
        # Search for property URLs
        property_urls = self.search_properties(location, max_pages=5)
        
        if not property_urls:
            logger.warning(f"⚠️ No properties found for {location}")
            return []
        
        # Limit the number of properties to scrape
        property_urls = property_urls[:max_properties]
        
        scraped_properties = []
        saved_count = 0
        
        for i, url in enumerate(property_urls, 1):
            logger.info(f"📊 Progress: {i}/{len(property_urls)}")
            
            # Scrape property details
            property_data = self.scrape_property_details(url)
            
            if property_data:
                scraped_properties.append(property_data)
                
                # Save to database
                property_id = self.save_property_to_db(property_data)
                if property_id:
                    saved_count += 1
                
                # Save to JSON file as backup
                self._save_property_backup(property_data)
        
        logger.info(f"🎉 Scraping completed!")
        logger.info(f"📊 Scraped: {len(scraped_properties)} properties")
        logger.info(f"💾 Saved to DB: {saved_count} properties")
        
        return scraped_properties
    
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
        property_dict = {
            'address': property_data.address,
            'city': property_data.city,
            'state': property_data.state,
            'zip_code': property_data.zip_code,
            'price': property_data.price,
            'bedrooms': property_data.bedrooms,
            'bathrooms': property_data.bathrooms,
            'square_feet': property_data.square_feet,
            'property_type': property_data.property_type,
            'description': property_data.description,
            'images': property_data.images,
            'zillow_url': property_data.zillow_url,
            'mls_number': property_data.mls_number,
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        existing_data.append(property_dict)
        
        # Save back to file
        with open(backup_file, 'w') as f:
            json.dump(existing_data, f, indent=2)

def main():
    """Main function to run the scraper"""
    scraper = ZillowScraper()
    
    # Example locations to scrape
    locations = [
        "San-Francisco-CA",
        "Los-Angeles-CA", 
        "Seattle-WA",
        "Austin-TX",
        "Miami-FL"
    ]
    
    all_properties = []
    
    for location in locations:
        logger.info(f"🌍 Scraping location: {location}")
        properties = scraper.scrape_location(location, max_properties=20)
        all_properties.extend(properties)
        
        # Add delay between locations
        time.sleep(5)
    
    logger.info(f"🎉 Total properties scraped: {len(all_properties)}")
    
    # Save summary
    summary = {
        'total_properties': len(all_properties),
        'locations_scraped': locations,
        'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'properties': [
            {
                'address': p.address,
                'city': p.city,
                'state': p.state,
                'price': p.price,
                'property_type': p.property_type
            }
            for p in all_properties
        ]
    }
    
    with open('scraping_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    logger.info("💾 Summary saved to scraping_summary.json")

if __name__ == "__main__":
    main()
