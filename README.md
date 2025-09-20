# REALagent - Tinder for Real Estate

REALagent is a real estate discovery platform that combines the swiping experience of Tinder with intelligent, agentic backend processes. Users can like, skip, or superlike properties, while an AI-powered backend adapts recommendations in real-time.

## Features

- 🏠 **Tinder-style Swipe Interface**: Intuitive property discovery with swipe gestures
- 🤖 **AI-Powered Recommendations**: Adaptive recommendations using vector embeddings and graph relationships
- 📊 **REALagent Advisor**: AI sidebar that provides personalized insights based on user preferences
- 🔄 **Real-time Updates**: Live property updates using Supabase Realtime
- 📱 **Mobile-First Design**: Responsive design optimized for mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL with pgvector for similarity search
- **Authentication**: Supabase Auth
- **Worker**: Python with sentence-transformers for embeddings
- **Deployment**: Vercel (Frontend), Railway (Worker)

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Supabase account
- Vercel account (for deployment)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd REALestate
npm install
```

### 2. Environment Setup

Copy the example environment files:

```bash
cp env.example .env.local
cp worker/env.example worker/.env
```

Update the environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Enable Row Level Security (RLS) policies

### 4. Data Ingestion

Set up the Python worker:

```bash
cd worker
pip install -r requirements.txt
python data_ingestion.py
```

### 5. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
REALestate/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── realagent/      # AI advisor components
│   │   ├── swipe/          # Property swipe components
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript type definitions
├── worker/                 # Python data ingestion worker
├── supabase/               # Database schema and migrations
└── README.md
```

## Key Components

### Property Swipe Interface

- `PropertyStack`: Manages the stack of property cards
- `PropertyCard`: Individual property card with swipe functionality
- Gesture-based interactions (swipe left/right/up)

### AI Advisor (REALagent)

- `AdvisorSidebar`: Provides personalized insights
- Analyzes user preferences from swipe history
- Generates contextual recommendations

### Recommendation Engine

- Vector similarity search using pgvector
- Graph-based property relationships
- Real-time user preference learning

## Database Schema

### Core Tables

- `app_user`: User profiles and embeddings
- `property`: Property listings with embeddings
- `interaction`: User swipe history
- `edge`: Property similarity relationships
- `recommendation_batch`: Generated recommendation sets

### Key Features

- Vector embeddings for semantic search
- Graph relationships for property similarity
- Real-time updates via Supabase Realtime
- Row Level Security (RLS) for data protection

## API Endpoints

- `GET /api/properties` - Get property listings with filters
- `POST /api/recommendations` - Get personalized recommendations
- `POST /api/interactions` - Record user interactions

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Worker (Railway)

1. Create a new Railway project
2. Connect your GitHub repository
3. Set environment variables
4. Deploy the worker from the `worker/` directory

## Demo Data

The worker creates sample properties in the Bay Area with:
- Realistic property data (prices, bedrooms, bathrooms)
- Generated property embeddings
- Similarity relationships between properties
- Investment metrics (cap rates, monthly rent)

## Future Enhancements

- MLS integration for real property data
- Advanced AI agent with natural language processing
- Investment analytics and ROI calculations
- Social features and property sharing
- Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Hackathon Demo

This project was built for a hackathon and demonstrates:
- Modern web development with Next.js and TypeScript
- AI-powered recommendation systems
- Real-time data synchronization
- Mobile-first responsive design
- Vector similarity search and graph relationships

Perfect for showcasing the "wow factor" of agentic property recommendations!
