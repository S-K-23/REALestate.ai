import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, TrendingUp, MapPin, DollarSign, Home, Loader2 } from 'lucide-react';

interface AdvisorSidebarProps {
  userId: string;
  isAnalyzingPreferences?: boolean;
  hasAnalyzedPreferences?: boolean;
}

interface UserPreferences {
  avgPrice?: number;
  preferredBedrooms?: number;
  preferredCities?: string[];
  propertyTypes?: string[];
  priceRange?: { min: number; max: number };
}

interface AdvisorMessage {
  type: 'preference' | 'market' | 'investment' | 'location';
  message: string;
  icon: React.ReactNode;
}

const AdvisorSidebar: React.FC<AdvisorSidebarProps> = ({ 
  userId, 
  isAnalyzingPreferences = false, 
  hasAnalyzedPreferences = false 
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, [userId]);

  useEffect(() => {
    if (isAnalyzingPreferences) {
      setMessages([{
        type: 'preference',
        message: "🧠 I'm analyzing your preferences based on your likes! This will help me find better matches for you.",
        icon: <Brain className="w-5 h-5" />
      }]);
    } else if (hasAnalyzedPreferences) {
      setMessages([{
        type: 'preference',
        message: "✨ Great! I've analyzed your preferences and updated my recommendations. You should now see more personalized property matches!",
        icon: <Brain className="w-5 h-5" />
      }]);
    }
  }, [isAnalyzingPreferences, hasAnalyzedPreferences]);

  const loadUserPreferences = async () => {
    try {
      // Get user's interactions to analyze preferences directly via API
      const response = await fetch(`http://localhost:3000/api/user-interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get user interactions');
      }

      const data = await response.json();
      const interactions = data.interactions || [];
      const likedProperties = interactions
        .filter((i: any) => i.interaction_type === 'like' && i.property)
        .map((i: any) => i.property)
        .filter(Boolean) || [];
      
      if (likedProperties.length === 0) {
        setMessages([{
          type: 'preference',
          message: "Start swiping to help me understand your preferences! I'll provide personalized insights as you explore properties.",
          icon: <Brain className="w-5 h-5" />
        }]);
        setPreferences({});
        setLoading(false);
        return;
      }

      // Analyze preferences
      const avgPrice = likedProperties.reduce((sum: number, p: any) => sum + p.price, 0) / likedProperties.length;
      const bedrooms = likedProperties.map((p: any) => p.bedrooms).filter(Boolean);
      const avgBedrooms = bedrooms.length > 0 ? bedrooms.reduce((sum: number, b: number) => sum + b, 0) / bedrooms.length : null;
      const cities = [...new Set(likedProperties.map((p: any) => p.city))];
      const propertyTypes = [...new Set(likedProperties.map((p: any) => p.property_type).filter(Boolean))];
      const prices = likedProperties.map((p: any) => p.price);
      const priceRange = { min: Math.min(...prices), max: Math.max(...prices) };

      const newPreferences = {
        avgPrice,
        preferredBedrooms: avgBedrooms,
        preferredCities: cities,
        propertyTypes,
        priceRange
      };

      setPreferences(newPreferences);
      generateAdvisorMessages(newPreferences, likedProperties);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessages([{
        type: 'preference',
        message: "Having trouble analyzing your preferences. Keep swiping and I'll learn more about what you like!",
        icon: <Brain className="w-5 h-5" />
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateAdvisorMessages = (prefs: UserPreferences, likedProperties: any[]) => {
    const newMessages: AdvisorMessage[] = [];

    // Price preference message
    if (prefs.avgPrice) {
      const priceMessage = prefs.avgPrice > 800000 
        ? `You seem to prefer luxury properties around $${Math.round(prefs.avgPrice / 1000)}k. Consider the long-term investment potential.`
        : prefs.avgPrice < 400000
        ? `You're looking at affordable properties around $${Math.round(prefs.avgPrice / 1000)}k. Great for first-time buyers!`
        : `Your sweet spot is around $${Math.round(prefs.avgPrice / 1000)}k. Good balance of quality and value.`;
      
      newMessages.push({
        type: 'preference',
        message: priceMessage,
        icon: <DollarSign className="w-5 h-5" />
      });
    }

    // Location preference message
    if (prefs.preferredCities && prefs.preferredCities.length > 0) {
      const cityMessage = prefs.preferredCities.length === 1
        ? `You're focused on ${prefs.preferredCities[0]}. Local market knowledge is key here.`
        : `You're exploring ${prefs.preferredCities.length} different cities: ${prefs.preferredCities.join(', ')}.`;
      
      newMessages.push({
        type: 'location',
        message: cityMessage,
        icon: <MapPin className="w-5 h-5" />
      });
    }

    // Bedroom preference message
    if (prefs.preferredBedrooms) {
      const bedroomMessage = prefs.preferredBedrooms >= 4
        ? `You prefer spacious ${Math.round(prefs.preferredBedrooms)}+ bedroom homes. Perfect for families!`
        : `You're looking at ${Math.round(prefs.preferredBedrooms)} bedroom properties. Great size for most lifestyles.`;
      
      newMessages.push({
        type: 'preference',
        message: bedroomMessage,
        icon: <Home className="w-5 h-5" />
      });
    }

    // Investment insights
    const investmentProperties = likedProperties.filter((p: any) => p.cap_rate && p.cap_rate > 5);
    if (investmentProperties.length > 0) {
      const avgCapRate = investmentProperties.reduce((sum: number, p: any) => sum + p.cap_rate, 0) / investmentProperties.length;
      newMessages.push({
        type: 'investment',
        message: `You've liked properties with ${avgCapRate.toFixed(1)}% average cap rate. Strong investment potential!`,
        icon: <TrendingUp className="w-5 h-5" />
      });
    }

    // Market insight
    if (likedProperties.length >= 5) {
      newMessages.push({
        type: 'market',
        message: `Based on your ${likedProperties.length} likes, you're developing a clear preference pattern. Keep swiping for better matches!`,
        icon: <Brain className="w-5 h-5" />
      });
    }

    setMessages(newMessages);
  };

  if (loading) {
    return (
      <Card className="h-full bg-gray-900/80 backdrop-blur-lg border-gray-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <Brain className="w-5 h-5 text-cyan-400" />
            REALagent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gray-900/80 backdrop-blur-lg border-gray-700/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <Brain className="w-5 h-5 text-cyan-400" />
          REALagent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-cyan-900/20 rounded-lg border border-cyan-700/30">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-cyan-600 text-white">
              AI
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-100">Your AI Advisor</p>
            <p className="text-xs text-gray-400">Analyzing your preferences...</p>
          </div>
        </div>

        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <div className="text-cyan-400 mt-0.5">
                  {message.icon}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {message.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50 text-cyan-400" />
            <p className="text-sm">Start swiping to get personalized insights!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvisorSidebar;
