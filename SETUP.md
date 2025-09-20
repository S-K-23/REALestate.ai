# REALagent Setup Guide

This guide will help you set up REALagent for local development and deployment.

## Prerequisites

- Node.js 18+ installed
- Python 3.8+ installed
- Supabase account (free tier works)
- Vercel account (for deployment)
- Railway account (for worker deployment)

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually 2-3 minutes)
3. Go to Settings > API to get your project URL and keys
4. Go to SQL Editor and run the schema from `supabase/schema.sql`

### Enable Extensions

In your Supabase SQL Editor, run:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

## Step 2: Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. For the Python worker, create `worker/.env`:
   ```bash
   cp worker/env.example worker/.env
   ```
   
   Update `worker/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Step 3: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies for the worker
cd worker
pip install -r requirements.txt
cd ..
```

## Step 4: Seed the Database

Run the Python worker to create sample properties:

```bash
cd worker
python data_ingestion.py
cd ..
```

This will:
- Create 28 sample properties in the Bay Area
- Generate embeddings for each property
- Create similarity relationships between properties
- Set up the initial data for the recommendation engine

## Step 5: Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Step 6: Test the Application

1. Sign up for a new account
2. Start swiping through properties
3. Watch the REALagent sidebar provide insights as you swipe
4. Check that recommendations improve after liking properties

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in the Vercel dashboard
4. Deploy!

### Worker (Railway)

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Set the root directory to `worker/`
4. Add environment variables
5. Deploy!

## Troubleshooting

### Common Issues

1. **"Extension 'vector' does not exist"**
   - Make sure you've enabled the vector extension in Supabase
   - Run: `CREATE EXTENSION IF NOT EXISTS "vector";`

2. **"Property recommendations not working"**
   - Check that the Python worker has run successfully
   - Verify properties exist in the database
   - Check browser console for API errors

3. **"Authentication not working"**
   - Verify Supabase URL and keys are correct
   - Check that RLS policies are enabled
   - Ensure the auth table is properly configured

4. **"Images not loading"**
   - The app uses Unsplash placeholder images
   - Check your internet connection
   - Images should load automatically

### Database Queries for Debugging

Check if data exists:

```sql
-- Check properties
SELECT COUNT(*) FROM property;

-- Check embeddings
SELECT id, array_length(property_embedding, 1) as embedding_size 
FROM property 
WHERE property_embedding IS NOT NULL;

-- Check edges
SELECT COUNT(*) FROM edge;

-- Check users
SELECT COUNT(*) FROM app_user;
```

## Demo Data

The worker creates realistic sample properties with:

- **Locations**: San Francisco, Oakland, Berkeley, San Jose, Palo Alto, Mountain View, Redwood City
- **Price Range**: $750k - $1.8M
- **Property Types**: Single family, condo, townhouse
- **Features**: Bedrooms (1-4), bathrooms (1-4), square footage (900-2800 sq ft)
- **Investment Data**: Monthly rent estimates and cap rates

## Next Steps

1. **Customize Properties**: Modify `worker/data_ingestion.py` to add your own property data
2. **Enhance AI Advisor**: Update `src/components/realagent/advisor-sidebar.tsx` with more sophisticated logic
3. **Add Filters**: Implement property filtering in the UI
4. **Mobile Optimization**: Test and optimize for mobile devices
5. **Real MLS Data**: Integrate with real estate APIs for live data

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure the database schema is properly installed
4. Check that the Python worker has run successfully

The application is designed to work out-of-the-box with the sample data, so you should be able to start swiping immediately after setup!
