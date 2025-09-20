#!/usr/bin/env python3
"""
Simple data ingestion worker that can work with or without Supabase
"""

import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def simple_embedding(text: str) -> List[float]:
    """Create a simple embedding using basic text features"""
    words = text.lower().split()
    
    # Feature vector (384 dimensions to match real embeddings)
    features = np.zeros(384)
    
    # Basic features
    features[0] = len(words)  # Word count
    features[1] = len(text)   # Character count
    features[2] = text.count('$')  # Price mentions
    features[3] = text.count('bedroom')  # Bedroom mentions
    features[4] = text.count('bathroom')  # Bathroom mentions
    features[5] = text.count('sq')  # Square footage mentions
    
    # Location features
    features[6] = 1 if 'san francisco' in text.lower() else 0
    features[7] = 1 if 'oakland' in text.lower() else 0
    features[8] = 1 if 'berkeley' in text.lower() else 0
    features[9] = 1 if 'san jose' in text.lower() else 0
    features[10] = 1 if 'palo alto' in text.lower() else 0
    features[11] = 1 if 'mountain view' in text.lower() else 0
    features[12] = 1 if 'redwood city' in text.lower() else 0
    
    # Property type features
    features[13] = 1 if 'single_family' in text.lower() else 0
    features[14] = 1 if 'condo' in text.lower() else 0
    features[15] = 1 if 'townhouse' in text.lower() else 0
    
    # Price range features (normalized)
    if '$' in text:
        try:
            import re
            price_match = re.search(r'\$[\d,]+', text)
            if price_match:
                price_str = price_match.group().replace('$', '').replace(',', '')
                price = float(price_str)
                features[16] = price / 1000000  # Normalize to millions
        except:
            pass
    
    # Bedroom features
    bedroom_match = re.search(r'bedrooms?:?\s*(\d+)', text.lower())
    if bedroom_match:
        bedrooms = int(bedroom_match.group(1))
        features[17] = bedrooms / 5.0  # Normalize
    
    # Bathroom features
    bathroom_match = re.search(r'bathrooms?:?\s*(\d+\.?\d*)', text.lower())
    if bathroom_match:
        bathrooms = float(bathroom_match.group(1))
        features[18] = bathrooms / 5.0  # Normalize
    
    # Square footage features
    sqft_match = re.search(r'(\d+)\s*sq\s*ft', text.lower())
    if sqft_match:
        sqft = int(sqft_match.group(1))
        features[19] = sqft / 3000.0  # Normalize
    
    # Fill remaining with deterministic random values
    np.random.seed(hash(text) % 2**32)
    features[20:] = np.random.normal(0, 0.1, 384 - 20)
    
    # Normalize the vector
    norm = np.linalg.norm(features)
    if norm > 0:
        features = features / norm
    
    return features.tolist()

class SimplePropertyIngestionWorker:
    def __init__(self):
        """Initialize the worker"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.supabase_client = None
        
        # Try to initialize Supabase client
        if self.supabase_url and self.supabase_key and self.supabase_url != 'your_supabase_url_here':
            try:
                from supabase import create_client, Client
                self.supabase_client = create_client(self.supabase_url, self.supabase_key)
                logger.info("✅ Supabase client initialized")
            except Exception as e:
                logger.warning(f"⚠️  Could not initialize Supabase client: {e}")
                logger.info("📝 Running in demo mode - data will be saved to JSON files")
        else:
            logger.info("📝 No Supabase credentials found - running in demo mode")
            logger.info("📝 Data will be saved to JSON files instead of database")

    def create_sample_properties(self) -> List[Dict[str, Any]]:
        """Create sample property data for the hackathon demo"""
        properties = [
            {
                "address": "123 Oak Street",
                "city": "San Francisco",
                "state": "CA",
                "zip_code": "94102",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "price": 1250000,
                "bedrooms": 3,
                "bathrooms": 2.5,
                "square_feet": 1800,
                "lot_size": 0.15,
                "property_type": "single_family",
                "year_built": 2015,
                "description": "Beautiful modern home in the heart of San Francisco with stunning city views.",
                "images": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"],
                "monthly_rent": 4500,
                "cap_rate": 4.3
            },
            {
                "address": "456 Pine Avenue",
                "city": "San Francisco",
                "state": "CA",
                "zip_code": "94110",
                "latitude": 37.7611,
                "longitude": -122.4208,
                "price": 950000,
                "bedrooms": 2,
                "bathrooms": 2,
                "square_feet": 1200,
                "lot_size": 0.08,
                "property_type": "condo",
                "year_built": 2020,
                "description": "Contemporary condo with open floor plan and modern amenities.",
                "images": ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"],
                "monthly_rent": 3800,
                "cap_rate": 4.8
            },
            {
                "address": "789 Maple Drive",
                "city": "Oakland",
                "state": "CA",
                "zip_code": "94601",
                "latitude": 37.8044,
                "longitude": -122.2712,
                "price": 750000,
                "bedrooms": 4,
                "bathrooms": 3,
                "square_feet": 2200,
                "lot_size": 0.25,
                "property_type": "single_family",
                "year_built": 1995,
                "description": "Spacious family home with large backyard, perfect for entertaining.",
                "images": ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"],
                "monthly_rent": 3200,
                "cap_rate": 5.1
            },
            {
                "address": "321 Elm Street",
                "city": "Berkeley",
                "state": "CA",
                "zip_code": "94704",
                "latitude": 37.8715,
                "longitude": -122.2730,
                "price": 1100000,
                "bedrooms": 3,
                "bathrooms": 2,
                "square_feet": 1600,
                "lot_size": 0.12,
                "property_type": "single_family",
                "year_built": 1985,
                "description": "Charming Craftsman home near UC Berkeley with character and modern updates.",
                "images": ["https://images.unsplash.com/photo-1600585154340-be6161a56a9c?w=800&h=600&fit=crop"],
                "monthly_rent": 4200,
                "cap_rate": 4.6
            },
            {
                "address": "654 Cedar Lane",
                "city": "San Jose",
                "state": "CA",
                "zip_code": "95110",
                "latitude": 37.3382,
                "longitude": -121.8863,
                "price": 850000,
                "bedrooms": 3,
                "bathrooms": 2.5,
                "square_feet": 1750,
                "lot_size": 0.18,
                "property_type": "townhouse",
                "year_built": 2010,
                "description": "Modern townhouse in Silicon Valley with tech-friendly amenities.",
                "images": ["https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop"],
                "monthly_rent": 3500,
                "cap_rate": 4.9
            },
            {
                "address": "987 Birch Boulevard",
                "city": "Palo Alto",
                "state": "CA",
                "zip_code": "94301",
                "latitude": 37.4419,
                "longitude": -122.1430,
                "price": 1800000,
                "bedrooms": 4,
                "bathrooms": 3.5,
                "square_feet": 2800,
                "lot_size": 0.35,
                "property_type": "single_family",
                "year_built": 2018,
                "description": "Luxury home in Palo Alto with smart home features and premium finishes.",
                "images": ["https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop"],
                "monthly_rent": 6500,
                "cap_rate": 4.3
            },
            {
                "address": "147 Willow Way",
                "city": "Mountain View",
                "state": "CA",
                "zip_code": "94040",
                "latitude": 37.3861,
                "longitude": -122.0839,
                "price": 1400000,
                "bedrooms": 3,
                "bathrooms": 2,
                "square_feet": 1900,
                "lot_size": 0.20,
                "property_type": "single_family",
                "year_built": 2005,
                "description": "Well-maintained home near Google headquarters with excellent schools.",
                "images": ["https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&h=600&fit=crop"],
                "monthly_rent": 5200,
                "cap_rate": 4.5
            },
            {
                "address": "258 Spruce Street",
                "city": "Redwood City",
                "state": "CA",
                "zip_code": "94063",
                "latitude": 37.4852,
                "longitude": -122.2364,
                "price": 1200000,
                "bedrooms": 4,
                "bathrooms": 3,
                "square_feet": 2100,
                "lot_size": 0.22,
                "property_type": "single_family",
                "year_built": 2012,
                "description": "Family-friendly home with updated kitchen and spacious backyard.",
                "images": ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop"],
                "monthly_rent": 4500,
                "cap_rate": 4.5
            }
        ]
        
        # Add more properties for better demo
        for i in range(20):
            base_property = properties[i % len(properties)]
            new_property = base_property.copy()
            new_property["address"] = f"{1000 + i} {base_property['address'].split(' ', 1)[1]}"
            new_property["price"] = int(base_property["price"] * (0.8 + (i % 5) * 0.1))
            new_property["bedrooms"] = base_property["bedrooms"] + (i % 3 - 1)
            new_property["square_feet"] = base_property["square_feet"] + (i % 4 - 2) * 100
            if new_property["bedrooms"] <= 0:
                new_property["bedrooms"] = 1
            if new_property["square_feet"] <= 800:
                new_property["square_feet"] = 900
            
            # Recalculate monthly rent and cap rate
            new_property["monthly_rent"] = int(new_property["price"] * 0.0035)  # Rough estimate
            new_property["cap_rate"] = round((new_property["monthly_rent"] * 12 / new_property["price"]) * 100, 1)
            
            properties.append(new_property)
        
        return properties

    def generate_property_embedding(self, property_data: Dict[str, Any]) -> List[float]:
        """Generate embedding for a property based on its features"""
        text_parts = [
            f"Address: {property_data['address']}",
            f"City: {property_data['city']}",
            f"Price: ${property_data['price']:,}",
            f"Bedrooms: {property_data.get('bedrooms', 'N/A')}",
            f"Bathrooms: {property_data.get('bathrooms', 'N/A')}",
            f"Square feet: {property_data.get('square_feet', 'N/A')}",
            f"Property type: {property_data.get('property_type', 'N/A')}",
        ]
        
        if property_data.get('description'):
            text_parts.append(f"Description: {property_data['description']}")
        
        text = " | ".join(text_parts)
        return simple_embedding(text)

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        dot_product = np.dot(vec1, vec2)
        return dot_product  # Already normalized

    def insert_properties_to_supabase(self, properties: List[Dict[str, Any]]) -> List[str]:
        """Insert properties into Supabase database"""
        property_ids = []
        
        for property_data in properties:
            try:
                # Generate embedding
                embedding = self.generate_property_embedding(property_data)
                property_data['property_embedding'] = embedding
                
                # Insert property
                response = self.supabase_client.table('property').insert(property_data).execute()
                
                if response.data:
                    property_id = response.data[0]['id']
                    property_ids.append(property_id)
                    logger.info(f"✅ Inserted property: {property_data['address']}")
                
            except Exception as e:
                logger.error(f"❌ Error inserting property {property_data['address']}: {e}")
        
        return property_ids

    def save_properties_to_json(self, properties: List[Dict[str, Any]]) -> List[str]:
        """Save properties to JSON file for demo mode"""
        property_ids = []
        
        for i, property_data in enumerate(properties):
            try:
                # Generate embedding
                embedding = self.generate_property_embedding(property_data)
                property_data['id'] = f"demo-property-{i+1}"
                property_data['property_embedding'] = embedding
                property_data['created_at'] = "2024-09-20T00:00:00Z"
                property_data['updated_at'] = "2024-09-20T00:00:00Z"
                
                property_ids.append(property_data['id'])
                logger.info(f"✅ Processed property: {property_data['address']}")
                
            except Exception as e:
                logger.error(f"❌ Error processing property {property_data['address']}: {e}")
        
        # Save to JSON file
        output_file = "demo_properties.json"
        with open(output_file, 'w') as f:
            json.dump({
                'properties': properties,
                'generated_at': '2024-09-20T00:00:00Z',
                'total_count': len(properties)
            }, f, indent=2)
        
        logger.info(f"💾 Saved {len(properties)} properties to {output_file}")
        return property_ids

    def create_property_edges(self, properties: List[Dict[str, Any]]) -> None:
        """Create graph edges between similar properties"""
        logger.info("🔗 Creating property similarity edges...")
        
        edges_created = 0
        similarity_threshold = 0.7  # Only create edges for highly similar properties
        
        for i, prop1 in enumerate(properties):
            if not prop1.get('property_embedding'):
                continue
                
            for j, prop2 in enumerate(properties[i+1:], i+1):
                if not prop2.get('property_embedding'):
                    continue
                
                similarity = self.calculate_similarity(
                    prop1['property_embedding'],
                    prop2['property_embedding']
                )
                
                if similarity > similarity_threshold:
                    edge_data = {
                        'id': f"edge-{i}-{j}",
                        'source_property_id': prop1.get('id') or prop1.get('property_id'),
                        'target_property_id': prop2.get('id') or prop2.get('property_id'),
                        'relationship_type': 'SIMILAR_TO',
                        'similarity_score': similarity,
                        'created_at': '2024-09-20T00:00:00Z'
                    }
                    
                    prop1.setdefault('edges', []).append(edge_data)
                    edges_created += 1
                    
                    if edges_created % 10 == 0:
                        logger.info(f"  Created {edges_created} edges...")
        
        logger.info(f"✅ Created {edges_created} property similarity edges")

    def run_ingestion(self) -> None:
        """Run the complete data ingestion process"""
        logger.info("🚀 Starting property data ingestion...")
        
        try:
            # Create sample properties
            properties = self.create_sample_properties()
            logger.info(f"📝 Created {len(properties)} sample properties")
            
            # Insert properties into database or save to JSON
            if self.supabase_client:
                property_ids = self.insert_properties_to_supabase(properties)
                logger.info(f"✅ Inserted {len(property_ids)} properties into Supabase")
            else:
                property_ids = self.save_properties_to_json(properties)
                logger.info(f"✅ Saved {len(property_ids)} properties to JSON")
            
            # Create property similarity edges
            self.create_property_edges(properties)
            
            logger.info("🎉 Data ingestion completed successfully!")
            
            if not self.supabase_client:
                logger.info("📁 Demo data files created:")
                logger.info("  - demo_properties.json: Property data with embeddings")
                logger.info("  - Use these files to test the frontend integration")
            
        except Exception as e:
            logger.error(f"❌ Error during ingestion: {e}")
            raise

def main():
    """Main entry point for the worker"""
    worker = SimplePropertyIngestionWorker()
    worker.run_ingestion()

if __name__ == "__main__":
    main()
