/**
 * API Endpoint: /api/translations
 * 
 * GET - Fetch all translations for a specific language
 * POST - Add/update a translation (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

// Cache for translations (5 minutes)
const translationCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * GET /api/translations?lang=en
 * Fetch all translations for a language
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'en'

    // Check cache first
    const cached = translationCache.get(lang)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true
      })
    }

    // Fetch from database using the helper function
    const result = await query(
      'SELECT * FROM get_translations($1)',
      [lang]
    )

    // Convert array of {key, value} to nested object
    const translations: any = {}
    for (const row of result.rows) {
      setNestedValue(translations, row.key, row.value)
    }

    // Cache the result
    translationCache.set(lang, {
      data: translations,
      timestamp: Date.now()
    })

    return NextResponse.json({
      success: true,
      data: translations,
      cached: false
    })

  } catch (error: any) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch translations'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/translations
 * Add or update a translation (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { key, languageCode, value, category, description } = body

    if (!key || !languageCode || !value) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: key, languageCode, value' },
        { status: 400 }
      )
    }

    // Use the upsert function
    await query(
      'SELECT upsert_translation($1, $2, $3, $4, $5)',
      [key, languageCode, value, category, description]
    )

    // Clear cache for this language
    translationCache.delete(languageCode)

    return NextResponse.json({
      success: true,
      message: 'Translation saved successfully'
    })

  } catch (error: any) {
    console.error('Error saving translation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to save translation'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to set nested object value from dot notation key
 * e.g., setNestedValue(obj, 'home.hero.title', 'Hello') 
 * -> obj.home.hero.title = 'Hello'
 */
function setNestedValue(obj: any, key: string, value: any) {
  const keys = key.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (!current[k] || typeof current[k] !== 'object') {
      current[k] = {}
    }
    current = current[k]
  }

  current[keys[keys.length - 1]] = value
}

