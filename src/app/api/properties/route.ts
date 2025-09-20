import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const city = searchParams.get('city')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')

    let query = supabase
      .from('property')
      .select('*')
      .order('created_at', { ascending: false })

    if (city) {
      query = query.eq('city', city)
    }

    if (minPrice) {
      query = query.gte('price', parseInt(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseInt(maxPrice))
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ properties: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
