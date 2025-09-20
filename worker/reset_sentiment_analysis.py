#!/usr/bin/env python3
"""
Reset Sentiment Analysis Script

This script resets the sentiment analysis by:
1. Clearing all user interactions
2. Resetting user embedding to null
3. Clearing preference analysis state

Usage: python worker/reset_sentiment_analysis.py
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def get_supabase_client() -> Client:
    """Get Supabase client using service role key"""
    url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not service_role_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
        sys.exit(1)
    
    return create_client(url, service_role_key)

def reset_sentiment_analysis(user_id: str = "550e8400-e29b-41d4-a716-446655440000"):
    """Reset sentiment analysis for a user"""
    supabase = get_supabase_client()
    
    print(f"🔄 Resetting sentiment analysis for user: {user_id}")
    
    try:
        # 1. Delete all user interactions
        print("🗑️  Deleting all user interactions...")
        result = supabase.table("interaction").delete().eq("user_id", user_id).execute()
        deleted_interactions = len(result.data) if result.data else 0
        print(f"✅ Deleted {deleted_interactions} interactions")
        
        # 2. Reset user embedding to null
        print("🧠 Resetting user embedding...")
        result = supabase.table("app_user").update({
            "user_embedding": None,
            "updated_at": "now()"
        }).eq("id", user_id).execute()
        
        if result.data:
            print("✅ User embedding reset to null")
        else:
            print("ℹ️  User not found in app_user table")
        
        # 3. Verify the reset
        print("\n🔍 Verifying reset...")
        
        # Check interactions
        interactions_result = supabase.table("interaction").select("*").eq("user_id", user_id).execute()
        remaining_interactions = len(interactions_result.data) if interactions_result.data else 0
        
        # Check user embedding
        user_result = supabase.table("app_user").select("user_embedding").eq("id", user_id).execute()
        user_embedding = user_result.data[0]["user_embedding"] if user_result.data else None
        
        print(f"📊 Remaining interactions: {remaining_interactions}")
        print(f"🧠 User embedding: {'null' if user_embedding is None else 'has value'}")
        
        if remaining_interactions == 0 and user_embedding is None:
            print("\n🎉 Sentiment analysis reset successfully!")
            print("✨ The user can now start fresh with a clean preference profile")
        else:
            print("\n⚠️  Reset may not be complete. Please check the results above.")
            
    except Exception as e:
        print(f"❌ Error resetting sentiment analysis: {e}")
        sys.exit(1)

def main():
    print("🧹 REALagent Sentiment Analysis Reset Tool")
    print("=" * 50)
    
    # Default demo user ID
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    
    print(f"Target user: {user_id}")
    print("This will reset:")
    print("  - All user interactions (likes, skips, superlikes)")
    print("  - User embedding/preference vector")
    print("  - Sentiment analysis state")
    print()
    
    # Confirm reset
    confirm = input("Are you sure you want to reset sentiment analysis? (y/N): ").strip().lower()
    
    if confirm in ['y', 'yes']:
        reset_sentiment_analysis(user_id)
    else:
        print("❌ Reset cancelled")

if __name__ == "__main__":
    main()
