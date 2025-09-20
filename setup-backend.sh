#!/bin/bash

echo "🏗️  REALagent Backend Setup"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ Created .env.local template"
else
    echo "✅ .env.local already exists"
fi

# Check if worker/.env exists
if [ ! -f "worker/.env" ]; then
    echo "📝 Creating worker/.env file..."
    cat > worker/.env << EOF
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
    echo "✅ Created worker/.env template"
else
    echo "✅ worker/.env already exists"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Copy your project URL and keys to .env.local and worker/.env"
echo "3. Run the database schema: supabase/schema.sql"
echo "4. Install Python dependencies: cd worker && pip install -r requirements.txt"
echo "5. Run data ingestion: cd worker && python data_ingestion.py"
echo "6. Start the app: npm run dev"
echo ""
echo "📖 See SETUP.md for detailed instructions"
