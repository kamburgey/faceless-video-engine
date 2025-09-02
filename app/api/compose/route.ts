import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const PEXELS_API_KEY = process.env.PEXELS_API_KEY

// Define a flexible asset type
interface Asset {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  source: 'pexels' | 'ai' | 'upload'
  metadata: {
    width: number
    height: number
    alt: string
    photographer: string
  }
  score: number
  selected: boolean
}

// Mock Pexels search for now
async function searchPexelsImages(query: string, aspectRatio: string, perPage: number = 10): Promise<Asset[]> {
  // For now, return mock data
  // TODO: Add real Pexels API integration
  return Array.from({ length: perPage }, (_, i) => ({
    id: `mock-${i}`,
    type: 'image' as const,
    url: `https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`,
    thumbnailUrl: `https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500`,
    source: 'pexels' as const,
    metadata: {
      width: aspectRatio === '16:9' ? 1920 : aspectRatio === '9:16' ? 1080 : 1080,
      height: aspectRatio === '16:9' ? 1080 : aspectRatio === '9:16' ? 1920 : 1080,
      alt: `${query} image ${i + 1}`,
      photographer: 'Mock Photographer',
    },
    score: Math.random() * 0.8 + 0.2, // Random score between 0.2-1.0
    selected: false,
  }))
}

async function generateAIImages(prompt: string, aspectRatio: string, count: number = 1): Promise<Asset[]> {
  try {
    const sizeMap = {
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '1:1': '1024x1024'
    }

    const size = sizeMap[aspectRatio as keyof typeof sizeMap] || '1024x1024'
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}. High quality, professional, cinematic lighting.`,
      n: 1,
      size: size as any,
      quality: "standard",
    })

    if (!response.data || response.data.length === 0) {
      return []
    }

    return response.data.map((image, index) => ({
      id: `ai-${Date.now()}-${index}`,
      type: 'image' as const,
      url: image.url || '',
      thumbnailUrl: image.url || '',
      source: 'ai' as const,
      metadata: {
        width: parseInt(size.split('x')[0]),
        height: parseInt(size.split('x')[1]),
        alt: prompt,
        photographer: 'AI Generated',
      },
      score: 0.9,
      selected: false,
    }))
  } catch (error) {
    console.error('AI image generation error:', error)
    return []
  }
}

function calculateSemanticScore(asset: Asset, beatText: string): number {
  // Simple keyword matching for now
  const assetText = (asset.metadata.alt || asset.metadata.photographer || '').toLowerCase()
  const beatWords = beatText.toLowerCase().split(' ')
  
  let matchScore = 0
  beatWords.forEach(word => {
    if (word.length > 3 && assetText.includes(word)) {
      matchScore += 1
    }
  })
  
  return Math.min(1, matchScore / beatWords.length)
}

export async function POST(req: NextRequest) {
  try {
    const { beatText, tone, template, aspectRatio, aiAggressiveness } = await req.json()

    if (!beatText) {
      return NextResponse.json({ error: 'Beat text is required' }, { status: 400 })
    }

    // Generate search query from beat text
    const searchQuery = beatText.slice(0, 100)
    
    // Set thresholds based on AI aggressiveness
    const stockMinScore = Math.max(0.3, 0.7 - (aiAggressiveness || 0.5) * 0.4)
    const maxAssetsPerBeat = 1
    
    console.log(`Searching for: "${searchQuery}" (min score: ${stockMinScore})`)

    // Search stock images
    const stockAssets = await searchPexelsImages(searchQuery, aspectRatio, 10)

    // Update scores based on semantic analysis
    const scoredStockAssets = stockAssets.map(asset => ({
      ...asset,
      score: calculateSemanticScore(asset, beatText)
    }))

    // Filter and sort stock assets by score
    const goodStockAssets = scoredStockAssets
      .filter(asset => asset.score >= stockMinScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxAssetsPerBeat)

    let finalAssets: Asset[] = [...goodStockAssets]

    // Generate AI assets if needed
    if (finalAssets.length < maxAssetsPerBeat && (aiAggressiveness || 0) > 0.1) {
      const aiAssetsNeeded = maxAssetsPerBeat - finalAssets.length
      const aiAssets = await generateAIImages(
        `${searchQuery}. ${tone} style, ${template} theme`,
        aspectRatio,
        aiAssetsNeeded
      )
      finalAssets.push(...aiAssets)
    }

    // Select the best asset if we have any
    if (finalAssets.length > 0) {
      finalAssets[0].selected = true
    }

    return NextResponse.json({
      assets: finalAssets,
      metadata: {
        searchQuery,
        stockResults: scoredStockAssets.length,
        stockMinScore,
        aiAssetsGenerated: finalAssets.filter(a => a.source === 'ai').length,
      }
    })

  } catch (error) {
    console.error('Compose error:', error)
    return NextResponse.json(
      { error: 'Failed to compose assets' },
      { status: 500 }
    )
  }
}
