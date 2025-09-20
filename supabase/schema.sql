-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
CREATE TYPE property_type AS ENUM ('single_family', 'condo', 'townhouse', 'multi_family');
CREATE TYPE interaction_type AS ENUM ('like', 'skip', 'superlike');

-- Users table
CREATE TABLE app_user (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    user_embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE property (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mls_number TEXT UNIQUE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    price DECIMAL(12, 2) NOT NULL,
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    square_feet INTEGER,
    lot_size DECIMAL(10, 2),
    property_type property_type,
    year_built INTEGER,
    description TEXT,
    images TEXT[],
    monthly_rent DECIMAL(10, 2), -- For investment analysis
    cap_rate DECIMAL(5, 2), -- Calculated cap rate
    property_embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Graph edges for property relationships
CREATE TABLE edge (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_property_id UUID REFERENCES property(id) ON DELETE CASCADE,
    target_property_id UUID REFERENCES property(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'SIMILAR_TO',
    similarity_score DECIMAL(5, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_property_id, target_property_id)
);

-- User interactions with properties
CREATE TABLE interaction (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
    property_id UUID REFERENCES property(id) ON DELETE CASCADE,
    interaction_type interaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Recommendation batches
CREATE TABLE recommendation_batch (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
    property_ids UUID[] NOT NULL,
    batch_number INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Realtime events for notifications
CREATE TABLE realtime_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_property_location ON property(city, state);
CREATE INDEX idx_property_price ON property(price);
CREATE INDEX idx_property_type ON property(property_type);
CREATE INDEX idx_interaction_user ON interaction(user_id);
CREATE INDEX idx_interaction_property ON interaction(property_id);
CREATE INDEX idx_edge_source ON edge(source_property_id);
CREATE INDEX idx_edge_target ON edge(target_property_id);
CREATE INDEX idx_recommendation_user ON recommendation_batch(user_id, is_active);

-- Vector similarity indexes
CREATE INDEX idx_property_embedding ON property USING ivfflat (property_embedding vector_cosine_ops);
CREATE INDEX idx_user_embedding ON app_user USING ivfflat (user_embedding vector_cosine_ops);

-- Row Level Security (RLS) policies
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE property ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_batch ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view all properties" ON property FOR SELECT USING (true);
CREATE POLICY "Users can insert their own interactions" ON interaction FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own interactions" ON interaction FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own recommendations" ON recommendation_batch FOR SELECT USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_property_updated_at BEFORE UPDATE ON property
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON app_user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get property recommendations
CREATE OR REPLACE FUNCTION get_property_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    property_id UUID,
    similarity_score DECIMAL,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_preferences AS (
        SELECT user_embedding, preferences
        FROM app_user
        WHERE id = p_user_id
    ),
    liked_properties AS (
        SELECT DISTINCT property_id
        FROM interaction
        WHERE user_id = p_user_id AND interaction_type = 'like'
    ),
    vector_similarities AS (
        SELECT 
            p.id as property_id,
            (1 - (p.property_embedding <=> up.user_embedding)) as similarity_score,
            'vector_similarity' as reason
        FROM property p, user_preferences up
        WHERE p.property_embedding IS NOT NULL 
        AND up.user_embedding IS NOT NULL
        AND p.id NOT IN (SELECT property_id FROM liked_properties)
    ),
    graph_boosts AS (
        SELECT 
            e.target_property_id as property_id,
            AVG(e.similarity_score) * 0.1 as similarity_score,
            'graph_boost' as reason
        FROM edge e
        JOIN liked_properties lp ON e.source_property_id = lp.property_id
        WHERE e.target_property_id NOT IN (SELECT property_id FROM liked_properties)
        GROUP BY e.target_property_id
    ),
    combined_scores AS (
        SELECT 
            COALESCE(vs.property_id, gb.property_id) as property_id,
            COALESCE(vs.similarity_score, 0) + COALESCE(gb.similarity_score, 0) as total_score,
            COALESCE(vs.reason, gb.reason) as reason
        FROM vector_similarities vs
        FULL OUTER JOIN graph_boosts gb ON vs.property_id = gb.property_id
    )
    SELECT 
        cs.property_id,
        cs.total_score as similarity_score,
        cs.reason
    FROM combined_scores cs
    ORDER BY cs.total_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
