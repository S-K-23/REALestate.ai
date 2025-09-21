import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, Home, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const { login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  useEffect(() => {
    // Auto-login if user already exists
    const existingUserId = localStorage.getItem('realestate_user_id');
    if (existingUserId) {
      onAuthSuccess();
    }
  }, [onAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login logic - for now, we'll create a new user automatically
        await handleAutoLogin();
      } else {
        // Register logic
        await handleRegister();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    // Generate a unique user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create user account automatically
    const response = await fetch('http://localhost:3000/api/auth/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        email: formData.email || `${userId}@example.com`,
        name: formData.name || 'Property Explorer'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user account');
    }

    const userData = await response.json();
    console.log('✅ User created successfully:', userData);

    // Store user data and login
    localStorage.setItem('realestate_user_id', userId);
    localStorage.setItem('realestate_user_email', formData.email || `${userId}@example.com`);
    localStorage.setItem('realestate_user_name', formData.name || 'Property Explorer');
    
    login(userData.user);
    onAuthSuccess();
  };

  const handleRegister = async () => {
    // Generate a unique user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create user account
    const response = await fetch('http://localhost:3000/api/auth/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        email: formData.email,
        name: formData.name || 'Property Explorer'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user account');
    }

    const userData = await response.json();
    console.log('✅ User registered successfully:', userData);

    // Store user data and login
    localStorage.setItem('realestate_user_id', userId);
    localStorage.setItem('realestate_user_email', formData.email);
    localStorage.setItem('realestate_user_name', formData.name || 'Property Explorer');
    
    login(userData.user);
    onAuthSuccess();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-lg border-gray-700/30 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Home className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-100">
              Welcome to RealEstate
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              {isLogin 
                ? "Discover your perfect property match" 
                : "Join thousands finding their dream homes"
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600/50 text-gray-100 placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 bg-gray-800/50 border-gray-600/50 text-gray-100 placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 bg-gray-800/50 border-gray-600/50 text-gray-100 placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700 text-white border-0 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">
                {isLogin ? "New to RealEstate?" : "Already have an account?"}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50"
          >
            {isLogin ? 'Create New Account' : 'Sign In Instead'}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
