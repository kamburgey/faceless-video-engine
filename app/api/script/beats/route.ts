import { NextRequest, NextResponse } from 'next/server'
import { calculateBeats } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { script } = await req.json()

    if (!script) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 })
    }

    // For now, use simple sentence-based segmentation
    // TODO: Implement semantic NLU-based beat detection
    const beatTexts = calculateBeats(script, 540) // Default target duration
    
    const beats = beatTexts.map((text, index) => ({
      id: `beat-${index}`,
      text: text.trim(),
      startTime: 0, // Will be calculated after voice generation
      duration: Math.max(3, Math.min(15, text.split(' ').length * 0.5)), // Rough estimate
    }))

    return NextResponse.json({ beats })

  } catch (error) {
    console.error('Beat segmentation error:', error)
    return NextResponse.json(
      { error: 'Failed to segment beats' },
      { status: 500 }
    )
  }
}
