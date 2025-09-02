import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const TEMPLATE_PROMPTS = {
  horror: "Create a spine-chilling script about {topic}. Use vivid, atmospheric descriptions that build suspense. Include mysterious elements and unexpected twists.",
  truecrime: "Write an investigative script about {topic}. Present facts methodically, include timeline details, and maintain objectivity while engaging the audience.",
  explainer: "Create an educational script about {topic}. Break down complex concepts into digestible parts with clear examples and practical applications.",
  history: "Write a historical narrative script about {topic}. Include key dates, important figures, and contextual background that brings the past to life.",
  sports: "Create a data-driven sports story about {topic}. Include statistics, player performances, and analytical insights that reveal deeper patterns."
}

const TONE_MODIFIERS = {
  cinematic: "Use cinematic language with rich visual descriptions and dramatic pacing.",
  investigative: "Maintain a professional, fact-based tone with analytical depth.",
  friendly: "Keep the tone conversational and approachable, like explaining to a friend.",
  epic: "Use inspiring, larger-than-life language that emphasizes significance and impact.",
  dry: "Employ subtle humor and understated delivery with occasional witty observations."
}

export async function POST(req: NextRequest) {
  try {
    const { topic, template, tone, targetDuration } = await req.json()

    if (!topic || !template || !tone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const templatePrompt = TEMPLATE_PROMPTS[template as keyof typeof TEMPLATE_PROMPTS]
    const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS]
    
    const targetWords = Math.floor(targetDuration * 2.5) // ~150 WPM speech rate
    
    const prompt = `${templatePrompt.replace('{topic}', topic)}

${toneModifier}

Target length: approximately ${targetWords} words (${Math.floor(targetDuration / 60)} minutes).

Structure the script with clear narrative beats that build engagement throughout. Each section should flow naturally to the next while maintaining viewer interest.

Topic: ${topic}

Write a compelling script:`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional scriptwriter specializing in engaging video content. Create scripts that are perfectly paced for voiceover and visual storytelling."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: Math.min(4000, Math.floor(targetWords * 2)),
      temperature: 0.7,
    })

    const script = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ 
      script,
      wordCount: script.split(' ').length,
      estimatedDuration: Math.floor(script.split(' ').length / 2.5)
    })

  } catch (error) {
    console.error('Script generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    )
  }
}
