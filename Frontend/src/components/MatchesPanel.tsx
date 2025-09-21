import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMatches } from '@/contexts/MatchesContext';
import { Heart, X, MapPin, Home, Calendar, ExternalLink } from 'lucide-react';

interface MatchesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll: () => void;
  onHighlightMatch?: (lat: number, lng: number) => void;
}

const MatchesPanel: React.FC<MatchesPanelProps> = ({ isOpen, onClose, onViewAll, onHighlightMatch }) => {
  const { matches, loading, removeMatchById } = useMatches();
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const handleRemoveMatch = async (interactionId: string) => {
    try {
      setRemovingId(interactionId);
      await removeMatchById(interactionId);
    } catch (error) {
      console.error('Error removing match:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-4 right-4 w-80 max-h-96 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200/50 z-[10000] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Your Matches</h3>
            <span className="bg-white/20 rounded-full px-2 py-1 text-xs font-medium">
              {matches.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="ml-3 text-gray-600">Loading matches...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💔</div>
            <h4 className="font-medium text-gray-900 mb-2">No matches yet</h4>
            <p className="text-sm text-gray-500">
              Start swiping and super like properties you love!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.slice(0, 5).map((match) => (
              <Card key={match.interaction_id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Property Image Placeholder */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="h-6 w-6 text-gray-400" />
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded p-1 -m-1"
                          onClick={() => {
                            if (match.latitude && match.longitude && onHighlightMatch) {
                              onHighlightMatch(match.latitude, match.longitude);
                            }
                          }}
                        >
                          <h4 className="font-semibold text-gray-900 truncate">
                            {match.price}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{match.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{match.bedrooms} bed</span>
                            <span>•</span>
                            <span>{match.bathrooms} bath</span>
                            <span>•</span>
                            <span>{match.area}</span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMatch(match.interaction_id)}
                          disabled={removingId === match.interaction_id}
                          className="text-gray-400 hover:text-red-500 h-6 w-6 p-0 flex-shrink-0"
                        >
                          {removingId === match.interaction_id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-red-500"></div>
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      {/* Date */}
                      <div className="flex items-center text-xs text-gray-400 mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Super liked {formatDate(match.superliked_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* View All Button */}
            {matches.length > 5 && (
              <Button
                onClick={onViewAll}
                variant="outline"
                className="w-full mt-3 border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View All {matches.length} Matches
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPanel;
