#!/usr/bin/env python3
"""
Test script to verify embeddings generation works
"""

import json
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any

def test_embeddings():
    """Test the embedding generation functionality"""
    print("🧠 Testing REALagent Embedding Generation")
    print("=" * 50)
    
    # Load the embedding model
    print("📥 Loading embedding model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Model loaded successfully!")
    
    # Test properties
    test_properties = [
        {
            "address": "123 Oak Street",
            "city": "San Francisco",
            "state": "CA",
            "price": 1250000,
            "bedrooms": 3,
            "bathrooms": 2.5,
            "square_feet": 1800,
            "property_type": "single_family",
            "description": "Beautiful modern home in the heart of San Francisco with stunning city views."
        },
        {
            "address": "456 Pine Avenue",
            "city": "San Francisco", 
            "state": "CA",
            "price": 950000,
            "bedrooms": 2,
            "bathrooms": 2,
            "square_feet": 1200,
            "property_type": "condo",
            "description": "Contemporary condo with open floor plan and modern amenities."
        }
    ]
    
    print(f"\n🏠 Processing {len(test_properties)} test properties...")
    
    embeddings = []
    for i, property_data in enumerate(test_properties, 1):
        print(f"  {i}. {property_data['address']}")
        
        # Create text representation
        text_parts = [
            f"Address: {property_data['address']}",
            f"City: {property_data['city']}",
            f"Price: ${property_data['price']:,}",
            f"Bedrooms: {property_data['bedrooms']}",
            f"Bathrooms: {property_data['bathrooms']}",
            f"Square feet: {property_data['square_feet']}",
            f"Property type: {property_data['property_type']}",
            f"Description: {property_data['description']}"
        ]
        
        text = " | ".join(text_parts)
        
        # Generate embedding
        embedding = model.encode(text)
        embeddings.append({
            'property': property_data,
            'embedding': embedding.tolist(),
            'text': text
        })
        
        print(f"     ✅ Generated {len(embedding)}-dimensional embedding")
    
    # Test similarity calculation
    print(f"\n🔍 Testing similarity calculation...")
    
    if len(embeddings) >= 2:
        embedding1 = np.array(embeddings[0]['embedding'])
        embedding2 = np.array(embeddings[1]['embedding'])
        
        # Calculate cosine similarity
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        similarity = dot_product / (norm1 * norm2)
        
        print(f"  Similarity between properties: {similarity:.4f}")
        print(f"  Property 1: {embeddings[0]['property']['address']}")
        print(f"  Property 2: {embeddings[1]['property']['address']}")
        
        if similarity > 0.7:
            print("  ✅ High similarity - properties are related")
        elif similarity > 0.5:
            print("  ⚠️  Medium similarity - some relationship")
        else:
            print("  📍 Low similarity - different property types")
    
    # Save test results
    output_file = "test_embeddings_output.json"
    with open(output_file, 'w') as f:
        json.dump({
            'embeddings': embeddings,
            'model_info': {
                'name': 'all-MiniLM-L6-v2',
                'dimension': len(embeddings[0]['embedding']),
                'properties_processed': len(embeddings)
            }
        }, f, indent=2)
    
    print(f"\n💾 Results saved to {output_file}")
    print("🎉 Embedding generation test completed successfully!")
    
    return embeddings

if __name__ == "__main__":
    test_embeddings()
