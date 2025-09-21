import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Property } from './PropertyCard';
import { useMatches } from '@/contexts/MatchesContext';
import { Heart, X, MapPin, Home, DollarSign, Loader2 } from 'lucide-react';

interface Match extends Property {
  superliked_at: string;
  interaction_id: string;
}

interface MatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MatchesModal: React.FC<MatchesModalProps> = ({ isOpen, onClose }) => {
  const { matches, loading, removeMatchById } = useMatches();
  const [removingId, setRemovingId] = useState<string | null>(null);

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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Your Matches ({matches.length})
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3">Loading matches...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground">
              Start swiping and super like properties you love to see them here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {matches.map((match) => (
              <div key={match.interaction_id} className="bg-card rounded-lg border p-4 space-y-3">
                {/* Property Image */}
                <div className="relative">
                  <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                    <Home className="h-12 w-12 text-muted-foreground" />
                  </div>
                  
                  {/* Super liked indicator */}
                  <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1.5">
                    <Heart className="w-3 h-3" />
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveMatch(match.interaction_id)}
                    disabled={removingId === match.interaction_id}
                    className="absolute top-2 left-2 h-8 w-8 p-0"
                  >
                    {removingId === match.interaction_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Property Details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">
                      {match.price}
                    </h3>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {match.type}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {match.location}
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{match.bedrooms} bed</span>
                    <span>•</span>
                    <span>{match.bathrooms} bath</span>
                    <span>•</span>
                    <span>{match.area}</span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {match.description}
                  </p>

                  <div className="text-xs text-muted-foreground">
                    Super liked on {formatDate(match.superliked_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MatchesModal;
