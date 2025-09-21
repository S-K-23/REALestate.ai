import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadMatches, removeMatch } from '@/lib/api-adapter';
import { Property } from '@/components/PropertyCard';

interface Match extends Property {
  superliked_at: string;
  interaction_id: string;
}

interface MatchesContextType {
  matches: Match[];
  matchesCount: number;
  loading: boolean;
  loadMatchesData: () => Promise<void>;
  addMatch: (match: Match) => void;
  removeMatchById: (interactionId: string) => Promise<boolean>;
  clearMatches: () => void;
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

export const useMatches = () => {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
};

interface MatchesProviderProps {
  children: ReactNode;
  userId?: string;
}

export const MatchesProvider: React.FC<MatchesProviderProps> = ({ children, userId }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadMatchesData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { matches: matchesData, count } = await loadMatches(userId);
      setMatches(matchesData as Match[]);
      setMatchesCount(count);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMatch = (match: Match) => {
    setMatches(prev => {
      // Check if match already exists to avoid duplicates
      const exists = prev.some(m => m.interaction_id === match.interaction_id);
      if (exists) return prev;
      
      return [...prev, match];
    });
    setMatchesCount(prev => prev + 1);
  };

  const removeMatchById = async (interactionId: string) => {
    try {
      const success = await removeMatch(interactionId);
      
      if (success) {
        setMatches(prev => prev.filter(match => match.interaction_id !== interactionId));
        setMatchesCount(prev => Math.max(0, prev - 1));
      }
      
      return success;
    } catch (error) {
      console.error('Error removing match:', error);
      return false;
    }
  };

  const clearMatches = () => {
    setMatches([]);
    setMatchesCount(0);
  };

  // Load matches when userId changes
  useEffect(() => {
    if (userId) {
      loadMatchesData();
    } else {
      clearMatches();
    }
  }, [userId]);

  const value = {
    matches,
    matchesCount,
    loading,
    loadMatchesData,
    addMatch,
    removeMatchById,
    clearMatches,
  };

  return (
    <MatchesContext.Provider value={value}>
      {children}
    </MatchesContext.Provider>
  );
};
