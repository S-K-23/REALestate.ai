#!/usr/bin/env python3
"""
REALagent Data Ingestion Worker

This script processes property data, generates embeddings, and creates graph relationships.
It's designed to run on Railway or as a standalone script.
"""

import os
import json
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PropertyIngestionWorker:
    def __init__(self):
        """Initialize the worker with Supabase client and embedding model."""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing Supabase credentials in environment variables")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # Load embedding model (lightweight for hackathon)
        logger.info("Loading embedding model...")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("Embedding model loaded successfully")

    def create_sample_properties(self) -> List[Dict[str, Any]]:
        """Create sample property data for the hackathon demo."""
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
                "monthly_rent": 4500,
                "images": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"]
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
                "monthly_rent": 3800,
                "images": ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"]
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
                "monthly_rent": 3200,
                "images": ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"]
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
                "monthly_rent": 4200,
                "images": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"]
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
                "monthly_rent": 3500,
                "images": ["https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop"]
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
                "monthly_rent": 6500,
                "images": ["https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop"]
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
                "monthly_rent": 5200,
                "images": ["https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&h=600&fit=crop"]
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
                "monthly_rent": 4500,
                "images": ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop"]
            }
        ]
        
        # Add more properties for better demo
        for i in range(20):
            base_property = properties[i % len(properties)]
            new_property = base_property.copy()
            new_property["address"] = f"{1000 + i} {base_property['address'].split(' ', 1)[1]}"
            new_property["price"] = base_property["price"] * (0.8 + (i % 5) * 0.1)
            new_property["bedrooms"] = base_property["bedrooms"] + (i % 3 - 1)
            new_property["square_feet"] = base_property["square_feet"] + (i % 4 - 2) * 100
            if new_property["bedrooms"] <= 0:
                new_property["bedrooms"] = 1
            if new_property["square_feet"] <= 800:
                new_property["square_feet"] = 900
            
            # Recalculate monthly rent and cap rate
            new_property["monthly_rent"] = new_property["price"] * 0.0035  # Rough estimate
            new_property["cap_rate"] = (new_property["monthly_rent"] * 12 / new_property["price"]) * 100
            
            properties.append(new_property)
        
        return properties

    def generate_property_embedding(self, property_data: Dict[str, Any]) -> List[float]:
        """Generate embedding for a property based on its features."""
        # Create a text representation of the property
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
        
        # Generate embedding
        embedding = self.embedding_model.encode(text)
        return embedding.tolist()

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings."""
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0
        
        return dot_product / (norm1 * norm2)

    def insert_properties(self, properties: List[Dict[str, Any]]) -> List[str]:
        """Insert properties into the database and return their IDs."""
        property_ids = []
        
        for property_data in properties:
            try:
                # Generate embedding
                embedding = self.generate_property_embedding(property_data)
                property_data['property_embedding'] = embedding
                
                # Insert property
                response = self.supabase.table('property').insert(property_data).execute()
                
                if response.data:
                    property_id = response.data[0]['id']
                    property_ids.append(property_id)
                    logger.info(f"Inserted property: {property_data['address']}")
                
            except Exception as e:
                logger.error(f"Error inserting property {property_data['address']}: {e}")
        
        return property_ids

    def create_property_edges(self, property_ids: List[str]) -> None:
        """Create graph edges between similar properties."""
        logger.info("Creating property similarity edges...")
        
        # Get all properties with their embeddings
        response = self.supabase.table('property').select('id, property_embedding').execute()
        properties = response.data
        
        edges_created = 0
        similarity_threshold = 0.7  # Only create edges for highly similar properties
        
        for i, prop1 in enumerate(properties):
            if not prop1['property_embedding']:
                continue
                
            for j, prop2 in enumerate(properties[i+1:], i+1):
                if not prop2['property_embedding']:
                    continue
                
                similarity = self.calculate_similarity(
                    prop1['property_embedding'],
                    prop2['property_embedding']
                )
                
                if similarity > similarity_threshold:
                    try:
                        edge_data = {
                            'source_property_id': prop1['id'],
                            'target_property_id': prop2['id'],
                            'relationship_type': 'SIMILAR_TO',
                            'similarity_score': similarity
                        }
                        
                        self.supabase.table('edge').insert(edge_data).execute()
                        edges_created += 1
                        
                    except Exception as e:
                        logger.error(f"Error creating edge: {e}")
        
        logger.info(f"Created {edges_created} property similarity edges")

    def run_ingestion(self) -> None:
        """Run the complete data ingestion process."""
        logger.info("Starting property data ingestion...")
        
        try:
            # Create sample properties
            properties = self.create_sample_properties()
            logger.info(f"Created {len(properties)} sample properties")
            
            # Insert properties into database
            property_ids = self.insert_properties(properties)
            logger.info(f"Inserted {len(property_ids)} properties into database")
            
            # Create property similarity edges
            self.create_property_edges(property_ids)
            
            logger.info("Data ingestion completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during ingestion: {e}")
            raise

def main():
    """Main entry point for the worker."""
    worker = PropertyIngestionWorker()
    worker.run_ingestion()

if __name__ == "__main__":
    main()
