import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { useMatches } from '@/contexts/MatchesContext';
import { User, Heart, MapPin, Calendar, Settings, LogOut, Edit3, Star, TrendingUp } from 'lucide-react';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useUser();
  const { matchesCount } = useMatches();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="absolute bottom-4 left-4 w-96 max-h-[80vh] bg-background/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] border border-border/60 z-[10000] overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-accent/5 before:rounded-2xl before:pointer-events-none
      transition-all duration-500 ease-in-out animate-fade-in">
      
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground">Profile</h3>
              <p className="text-muted-foreground text-sm">Manage your account</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-background/50 h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto relative">
        {/* User Info */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-lg">Real Estate Investor</h4>
                <p className="text-muted-foreground text-sm">User ID: {user?.id?.slice(0, 8)}...</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="border border-border/30 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Matches</span>
              </div>
              <div className="text-2xl font-bold text-primary">{matchesCount}</div>
              <div className="text-xs text-muted-foreground">Properties loved</div>
            </CardContent>
          </Card>

          <Card className="border border-border/30 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Locations</span>
              </div>
              <div className="text-2xl font-bold text-accent">12</div>
              <div className="text-xs text-muted-foreground">Cities explored</div>
            </CardContent>
          </Card>
        </div>

        {/* Activity */}
        <Card className="border border-border/30 bg-background/50 backdrop-blur-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Super liked a property</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Explored Miami market</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Analyzed market trends</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-foreground border-border/30 hover:bg-background/50"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-foreground border-border/30 hover:bg-background/50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
