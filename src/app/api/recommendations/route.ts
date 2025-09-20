import { NextRequest, NextResponse } from 'next/server'
import { backendService } from '@/lib/backend-service'

export async function POST(request: NextRequest) {
  try {
    const { userId, limit = 50 } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🎯 Getting recommendations for user:', userId)

    // Use the backend service for recommendations
    const recommendations = await backendService.getRecommendations(userId, limit)

    console.log(`🎯 Got ${recommendations.length} recommendations`)

    return NextResponse.json({ recommendations })
  } catch (error: any) {
    console.error('Error in recommendations API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
