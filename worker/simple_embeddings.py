#!/usr/bin/env python3
"""
Simple embeddings test using basic numpy operations
"""

import json
import numpy as np
from typing import List, Dict, Any

def simple_embedding(text: str) -> List[float]:
    """Create a simple embedding using basic text features"""
    # Simple feature extraction
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
    
    # Property type features
    features[11] = 1 if 'single_family' in text.lower() else 0
    features[12] = 1 if 'condo' in text.lower() else 0
    features[13] = 1 if 'townhouse' in text.lower() else 0
    
    # Price range features (normalized)
    if '$' in text:
        try:
            # Extract first price found
            import re
            price_match = re.search(r'\$[\d,]+', text)
            if price_match:
                price_str = price_match.group().replace('$', '').replace(',', '')
                price = float(price_str)
                features[14] = price / 1000000  # Normalize to millions
        except:
            pass
    
    # Fill remaining with random values for demo
    np.random.seed(hash(text) % 2**32)  # Deterministic based on text
    features[15:] = np.random.normal(0, 0.1, 384 - 15)
    
    # Normalize the vector
    norm = np.linalg.norm(features)
    if norm > 0:
        features = features / norm
    
    return features.tolist()

def test_simple_embeddings():
    """Test the simple embedding generation"""
    print("🧠 Testing Simple Embedding Generation")
    print("=" * 50)
    
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
        },
        {
            "address": "789 Maple Drive",
            "city": "Oakland",
            "state": "CA",
            "price": 750000,
            "bedrooms": 4,
            "bathrooms": 3,
            "square_feet": 2200,
            "property_type": "single_family",
            "description": "Spacious family home with large backyard, perfect for entertaining."
        }
    ]
    
    print(f"🏠 Processing {len(test_properties)} test properties...")
    
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
        
        # Generate simple embedding
        embedding = simple_embedding(text)
        embeddings.append({
            'property': property_data,
            'embedding': embedding,
            'text': text
        })
        
        print(f"     ✅ Generated {len(embedding)}-dimensional embedding")
    
    # Test similarity calculation
    print(f"\n🔍 Testing similarity calculation...")
    
    similarities = []
    for i in range(len(embeddings)):
        for j in range(i + 1, len(embeddings)):
            embedding1 = np.array(embeddings[i]['embedding'])
            embedding2 = np.array(embeddings[j]['embedding'])
            
            # Calculate cosine similarity
            dot_product = np.dot(embedding1, embedding2)
            similarity = dot_product  # Already normalized
            
            similarities.append({
                'property1': embeddings[i]['property']['address'],
                'property2': embeddings[j]['property']['address'],
                'similarity': similarity
            })
            
            print(f"  {embeddings[i]['property']['address']} ↔ {embeddings[j]['property']['address']}: {similarity:.4f}")
    
    # Save test results
    output_file = "simple_embeddings_output.json"
    with open(output_file, 'w') as f:
        json.dump({
            'embeddings': embeddings,
            'similarities': similarities,
            'model_info': {
                'name': 'simple_feature_based',
                'dimension': 384,
                'properties_processed': len(embeddings)
            }
        }, f, indent=2)
    
    print(f"\n💾 Results saved to {output_file}")
    print("🎉 Simple embedding generation test completed successfully!")
    
    return embeddings

if __name__ == "__main__":
    test_simple_embeddings()
