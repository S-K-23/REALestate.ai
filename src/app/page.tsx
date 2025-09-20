'use client'

import { useEffect, useState } from 'react'
import { backendService } from '@/lib/backend-service'
// import { User } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  display_name?: string
}
import AuthForm from '@/components/auth/auth-form'
import PropertyStack from '@/components/swipe/property-stack'
import AdvisorSidebar from '@/components/realagent/advisor-sidebar'
import { Button } from '@/components/ui/button'
import { LogOut, Settings } from 'lucide-react'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnalyzingPreferences, setIsAnalyzingPreferences] = useState(false)
  const [hasAnalyzedPreferences, setHasAnalyzedPreferences] = useState(false)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('realagent-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setLoading(false)
      return
    }

    // Check if Supabase is properly configured
    if (!backendService.isUsingSupabase()) {
      setLoading(false)
      return
    }

    // Create a demo user for testing with Supabase
    setUser({
      id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
      email: 'demo@realagent.com',
      display_name: 'Demo User'
    })
    setLoading(false)
  }, [])

  const handleSignOut = async () => {
    // Clear user from localStorage and state
    localStorage.removeItem('realagent-user')
    setUser(null)
  }

  const handlePreferenceAnalysisChange = (isAnalyzing: boolean, hasAnalyzed: boolean) => {
    setIsAnalyzingPreferences(isAnalyzing)
    setHasAnalyzedPreferences(hasAnalyzed)
  }

  const handleResetSentimentAnalysis = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/reset-sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      })

      if (!response.ok) {
        throw new Error('Failed to reset sentiment analysis')
      }

      const result = await response.json()
      console.log('🎉 Sentiment analysis reset:', result.message)
      
      // Reset the analysis states
      setIsAnalyzingPreferences(false)
      setHasAnalyzedPreferences(false)
      
      // Reload the page to start fresh
      window.location.reload()
      
    } catch (error) {
      console.error('Error resetting sentiment analysis:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    // Check if Supabase is configured
    if (!backendService.isUsingSupabase()) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">REALagent</h1>
              <p className="text-gray-600">Tinder for Real Estate</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <h3 className="font-semibold mb-4 text-red-600">⚠️ Configuration Required</h3>
              <p className="text-sm text-gray-600 mb-4">
                Supabase is not properly configured. Please check your environment variables:
              </p>
              <ul className="text-xs text-left text-gray-500 mb-4 space-y-1">
                <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
              <p className="text-xs text-gray-500">
                See the README.md for setup instructions.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">REALagent</h1>
            <p className="text-gray-600">Tinder for Real Estate</p>
          </div>
          
          <AuthForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">REALagent</h1>
              <p className="text-sm text-gray-600">Discover your perfect property</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleResetSentimentAnalysis}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                title="Reset sentiment analysis and start fresh"
              >
                <span className="mr-2">🧠</span>
                Reset AI
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
          {/* Property Stack - Takes up 3/4 of the width */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border h-full">
              <PropertyStack 
                userId={user.id} 
                onPreferenceAnalysisChange={handlePreferenceAnalysisChange}
              />
            </div>
          </div>

          {/* Advisor Sidebar - Takes up 1/4 of the width */}
          <div className="lg:col-span-1">
            <AdvisorSidebar 
              userId={user.id} 
              isAnalyzingPreferences={isAnalyzingPreferences}
              hasAnalyzedPreferences={hasAnalyzedPreferences}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
