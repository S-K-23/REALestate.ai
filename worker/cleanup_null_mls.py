#!/usr/bin/env python3
"""
Cleanup Properties with Null MLS Numbers
Removes all properties that have mls_number = null
"""

import os
import sys
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

def cleanup_null_mls_properties():
    """
    Remove all properties with null MLS numbers
    """
    try:
        # First, get all properties with null MLS numbers
        response = supabase.table('property').select('id, address, mls_number').is_('mls_number', 'null').execute()
        properties_to_delete = response.data
        
        print(f"📋 Found {len(properties_to_delete)} properties with null MLS numbers")
        
        if len(properties_to_delete) == 0:
            print("✅ No properties with null MLS numbers found")
            return
        
        # Show some examples of what will be deleted
        print("\n🗑️  Properties to be deleted:")
        for i, prop in enumerate(properties_to_delete[:5]):
            print(f"   {i+1}. {prop['address']} (ID: {prop['id']})")
        
        if len(properties_to_delete) > 5:
            print(f"   ... and {len(properties_to_delete) - 5} more")
        
        # Delete properties with null MLS numbers
        delete_response = supabase.table('property').delete().is_('mls_number', 'null').execute()
        
        print(f"\n✅ Successfully deleted {len(properties_to_delete)} properties with null MLS numbers")
        
        # Verify the deletion
        remaining_response = supabase.table('property').select('id').execute()
        remaining_count = len(remaining_response.data)
        
        print(f"📊 Remaining properties in database: {remaining_count}")
        
        # Show some remaining properties
        remaining_properties = supabase.table('property').select('id, address, mls_number').limit(5).execute()
        print("\n🏠 Remaining properties (first 5):")
        for i, prop in enumerate(remaining_properties.data):
            print(f"   {i+1}. {prop['address']} (MLS: {prop['mls_number']})")
        
    except Exception as e:
        print(f"❌ Error cleaning up properties: {str(e)}")

def main():
    """
    Main function to cleanup properties with null MLS numbers
    """
    print("🚀 Starting MLS Number Cleanup")
    print("=" * 50)
    print("🗑️  Removing all properties with mls_number = null")
    print("=" * 50)
    
    cleanup_null_mls_properties()
    
    print("\n✅ MLS cleanup completed!")

if __name__ == "__main__":
    main()
