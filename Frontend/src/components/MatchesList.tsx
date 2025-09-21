import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMatches } from '@/contexts/MatchesContext';
import { Heart, X, MapPin, Home, Calendar, ExternalLink, Star, DollarSign } from 'lucide-react';

interface MatchesListProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetails?: (match: any) => void;
}

const MatchesList: React.FC<MatchesListProps> = ({ isOpen, onClose, onViewDetails }) => {
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
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: string) => {
    // Extract numeric value and format
    const numericPrice = price.replace(/[^0-9]/g, '');
    return `$${parseInt(numericPrice).toLocaleString()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-4 left-4 w-96 max-h-[80vh] bg-background/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] border border-border/60 z-[10000] overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-accent/5 before:rounded-2xl before:pointer-events-none
      transition-all duration-500 ease-in-out animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground">Your Matches</h3>
              <p className="text-muted-foreground text-sm">{matches.length} properties you loved</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-background/50 h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <span className="ml-4 text-muted-foreground font-medium">Loading your matches...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h4 className="font-bold text-foreground text-lg mb-2">No matches yet</h4>
            <p className="text-muted-foreground mb-4">
              Start swiping and super like properties you love to see them here!
            </p>
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start Exploring
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <Card key={match.interaction_id} className="border border-border/30 hover:shadow-lg transition-all duration-200 hover:border-primary/20 bg-background/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Property Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                      <Home className="h-8 w-8 text-primary" />
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-foreground text-lg">
                              {formatPrice(match.price)}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-muted-foreground">Super Liked</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate font-medium">{match.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                            <span className="bg-muted/50 px-2 py-1 rounded-full text-xs font-medium">
                              {match.bedrooms} bed
                            </span>
                            <span className="bg-muted/50 px-2 py-1 rounded-full text-xs font-medium">
                              {match.bathrooms} bath
                            </span>
                            <span className="bg-muted/50 px-2 py-1 rounded-full text-xs font-medium">
                              {match.area}
                            </span>
                          </div>

                          {match.cap_rate && (
                            <div className="flex items-center gap-1 text-sm text-emerald-500 font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>{match.cap_rate}% cap rate</span>
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMatch(match.interaction_id)}
                          disabled={removingId === match.interaction_id}
                          className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 flex-shrink-0"
                        >
                          {removingId === match.interaction_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b border-destructive"></div>
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Date and Actions */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Super liked {formatDate(match.superliked_at)}</span>
                        </div>
                        
                        {onViewDetails && (
                          <Button
                            onClick={() => onViewDetails(match)}
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary/20 hover:bg-primary/10 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Summary */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 mt-4 border border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-foreground">Total Matches</h5>
                  <p className="text-sm text-muted-foreground">Properties you've super liked</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{matches.length}</div>
                  <div className="text-xs text-muted-foreground">matches</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesList;
