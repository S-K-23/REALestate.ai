# REALestate.ai - AI-Powered Real Estate Discovery

REALestate.ai is a modern real estate discovery platform that combines intelligent property recommendations with an intuitive swipe interface. Users can explore properties through location-based search, apply advanced filters, and get personalized recommendations powered by AI.

## 🏠 Features

- **🗺️ Interactive Map Interface**: Browse properties on an interactive map with location-based search
- **📱 Swipe Interface**: Tinder-style property discovery with intuitive swipe gestures
- **🔍 Advanced Filtering**: Filter by price, bedrooms, bathrooms, property type, year built, cap rate, and more
- **📍 Location-Based Search**: Search within customizable radius (10km - 1000km)
- **🤖 AI Recommendations**: Intelligent property recommendations with fallback mechanisms
- **📊 Real-Time Updates**: Live property data and user interactions
- **💻 Responsive Design**: Optimized for both desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Maps**: Custom map implementation with location search

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd REALestate
```

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the database schema (create tables for properties, users, interactions)

### 4. Frontend Setup

```bash
cd Frontend
npm install
```

### 5. Start Development Servers

**Backend (Terminal 1):**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Frontend (Terminal 2):**
```bash
cd Frontend
npm run dev
# Runs on http://localhost:8080
```

### 6. Access the Application

Open your browser and navigate to `http://localhost:8080` to see REALestate.ai in action!

## 📁 Project Structure

```
REALestate/
├── src/                          # Backend (Next.js)
│   ├── app/
│   │   ├── api/                 # API endpoints
│   │   │   └── recommendations/ # Property recommendations API
│   │   └── globals.css          # Global styles
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   └── backend-service.ts   # Backend utilities
│   └── components/              # Backend components
├── Frontend/                     # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SwipeInterface.tsx    # Main swipe interface
│   │   │   ├── FilterPanel.tsx       # Property filters
│   │   │   ├── PropertyCard.tsx      # Individual property cards
│   │   │   └── ui/                   # Reusable UI components
│   │   ├── pages/
│   │   │   └── Index.tsx             # Main page
│   │   ├── contexts/
│   │   │   ├── UserContext.tsx       # User management
│   │   │   └── MatchesContext.tsx    # Property matches
│   │   └── lib/
│   │       └── api-adapter.ts        # Frontend API utilities
│   └── index.html                    # Main HTML file
├── worker/                       # Data ingestion (Python)
└── README.md
```

## 🎯 Key Components

### Map Interface
- Interactive property browsing on a map
- Location-based search with customizable radius
- Property pins with hover information

### Swipe Interface
- **PropertyCard**: Individual property cards with detailed information
- **SwipeInterface**: Main swipe container with gesture handling
- **FilterPanel**: Advanced filtering options
- Like/Skip functionality with real-time updates

### Recommendation Engine
- **Location-based search**: Properties within specified radius
- **Vector similarity**: AI-powered property matching
- **Graph relationships**: Collaborative filtering
- **Fallback mechanisms**: Ensures users always see properties

## 🔧 API Endpoints

### Recommendations API
```
POST /api/recommendations
```
**Request Body:**
```json
{
  "userId": "user-id",
  "location": {
    "lat": 41.8781,
    "lng": -87.6298,
    "name": "Chicago"
  },
  "searchRadius": 100,
  "filters": {
    "priceRange": [100000, 500000],
    "bedrooms": [2, 4],
    "propertyTypes": ["single_family", "condo"]
  }
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": "property-id",
      "title": "3 bed condo",
      "price": "$425,000",
      "location": "Chicago, IL",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": "1,200 sq ft",
      "image": "property-image-url",
      "similarity_score": 0.85,
      "reason": "location_priority"
    }
  ]
}
```

## 🎨 Features in Detail

### Advanced Filtering
- **Price Range**: Set min/max property prices
- **Bedrooms/Bathrooms**: Range-based filtering
- **Property Types**: Single family, condo, townhouse, multi-family
- **Square Footage**: Size-based filtering
- **Year Built**: Construction date filtering
- **Cap Rate**: Investment return filtering (handles null values)
- **States**: Geographic filtering
- **Search Radius**: 10km to 1000km radius control

### Smart Recommendations
1. **Location Priority**: Properties within search radius
2. **Vector Similarity**: AI-powered matching based on embeddings
3. **Graph Relationships**: Collaborative filtering from similar users
4. **Fallback Search**: Ensures properties are always available

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live property data and interactions
- **Error Handling**: Graceful error messages and retry functionality
- **Loading States**: Smooth loading indicators

## 🚀 Deployment

### Backend (Railway/Vercel)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd Frontend && npm run build`
2. Deploy the `dist` folder
3. Set environment variables for API endpoints

## 🎯 Getting Started Tips

1. **Start with Map View**: Click on the map to select a location
2. **Adjust Search Radius**: Use the filter panel to control search area
3. **Apply Filters**: Use the advanced filters to narrow down properties
4. **Switch to Swipe**: Click "Start Swiping" to begin property discovery
5. **Like Properties**: Swipe right or click the heart icon
6. **Skip Properties**: Swipe left or click the X icon

## 🔍 Troubleshooting

### Common Issues

**No properties showing:**
- Check if search radius is too small
- Verify filters aren't too restrictive
- Ensure backend is running on port 3000

**API errors:**
- Verify Supabase credentials in `.env.local`
- Check database connection
- Ensure API endpoints are accessible

**Frontend not loading:**
- Verify frontend is running on port 8080
- Check browser console for errors
- Ensure backend API is accessible

## 📊 Database Schema

### Core Tables
- **property**: Property listings with location, price, details
- **app_user**: User profiles and preferences
- **interaction**: User swipe history and preferences

### Key Features
- Vector embeddings for AI recommendations
- Geographic data for location-based search
- Real-time updates via Supabase
- Row Level Security (RLS) for data protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🌟 Demo

<img width="2122" height="1206" alt="Screenshot 2025-09-20 at 11 32 27 PM" src="https://github.com/user-attachments/assets/9cd82696-9fcc-41e5-b431-8e339897760d" />
<img width="2122" height="1206" alt="Screenshot 2025-09-20 at 11 32 38 PM" src="https://github.com/user-attachments/assets/2a798a7a-6ad0-414d-9f36-6086960e5ec5" />
<img width="2122" height="1206" alt="Screenshot 2025-09-20 at 11 34 08 PM" src="https://github.com/user-attachments/assets/26d64c53-74d4-4aff-a285-a9be107cc84c" />
