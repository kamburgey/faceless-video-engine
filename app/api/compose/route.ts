import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const PEXELS_API_KEY = process.env.PEXELS_API_KEY

// Mock Pexels search for now
async function searchPexelsImages(query: string, aspectRatio: string, perPage: number = 10) {
  // For now, return mock data
  // TODO: Add real Pexels API integration
  return Array.from({ length: perPage }, (_, i) => ({
    id: `mock-${i}`,
    width: aspectRatio === '16:9' ? 1920 : aspectRatio === '9:16' ? 1080 : 1080,
    height: aspectRatio === '16:9' ? 1080 : aspectRatio === '9:16' ? 1920 : 1080,
    photographer: 'Mock Photographer',
    src: {
      large: `https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`,
      medium: `https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500`,
    },
    alt: `${query} image ${i + 1}`,
  }))
}

async function generateAIImages(prompt: string, aspectRatio: string, count: number = 1) {
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

    return response.data.map((image, index) => ({
      id: `ai-${Date.now()}-${index}`,
      type: 'image' as const,
      url: image.url!,
      source: 'ai' as const,
      metadata: {
        width: parseInt(size.split('x')[0]),
        height: parseInt(size.split('x')[1]),
        alt: prompt,
      },
      score: 0.9, // AI images get a high score
      selected: false,
    }))
  } catch (error) {
    console.error('AI image generation error:', error)
    return []
  }
}

function calculateSemanticScore(asset: any, beatText: string): number {
  // Simple keyword matching for now
  // TODO: Implement proper embeddings-based semantic similarity
  const assetText = (asset.alt || asset.photographer || '').toLowerCase()
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
    const searchQuery = beatText.slice(0, 100) // Limit query length
    
    // Set thresholds based on AI aggressiveness
    const stockMinScore = Math.max(0.3, 0.7 - (aiAggressiveness || 0.5) * 0.4)
    const maxAssetsPerBeat = 1 // Start with 1 asset per beat
    
    console.log(`Searching for: "${searchQuery}" (min score: ${stockMinScore})`)

    // Search stock images
    const stockImages = await searchPexelsImages(searchQuery, aspectRatio, 10)

    // Convert to standardized format and calculate scores
    const stockAssets = stockImages.map(photo => ({
      id: `pexels-img-${photo.id}`,
      type: 'image' as const,
      url: photo.src.large,
      thumbnailUrl: photo.src.medium,
      source: 'pexels' as const,
      metadata: {
        width: photo.width,
        height: photo.height,
        alt: photo.alt,
        photographer: photo.photographer,
      },
      score: calculateSemanticScore(photo, beatText),
      selected: false,
    }))

    // Filter and sort stock assets by score
    const goodStockAssets = stockAssets
      .filter(asset => asset.score >= stockMinScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxAssetsPerBeat)

    let finalAssets = [...goodStockAssets]

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
        stockResults: stockAssets.length,
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
