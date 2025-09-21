import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Creating new user')

    const serverClient = createServerClient()
    
    if (!serverClient) {
      return NextResponse.json({ error: 'Failed to create server client' }, { status: 500 })
    }

    // Create a new user with a UUID
    const userId = crypto.randomUUID()
    
    const { data: userData, error: userError } = await serverClient
      .from('app_user')
      .insert([
        {
          id: userId,
          email: `user-${userId}@example.com`, // Dummy email to satisfy constraint
          created_at: new Date().toISOString(),
          user_embedding: null
        }
      ])
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    console.log('✅ Created user:', userId)

    const response = NextResponse.json({ 
      user: {
        id: userId,
        created_at: userData.created_at
      }
    })
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response

  } catch (error: any) {
    console.error('Error in create user API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
