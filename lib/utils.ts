import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function calculateBeats(text: string, targetDuration: number): string[] {
  // Simple sentence-based splitting for now
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgDurationPerSentence = targetDuration / sentences.length
  
  // Group sentences if they're too short
  const beats: string[] = []
  let currentBeat = ''
  let currentDuration = 0
  
  for (const sentence of sentences) {
    const sentenceDuration = sentence.split(' ').length * 0.5 // Rough estimation
    
    if (currentDuration > 0 && currentDuration + sentenceDuration > avgDurationPerSentence * 1.5) {
      beats.push(currentBeat.trim())
      currentBeat = sentence
      currentDuration = sentenceDuration
    } else {
      currentBeat += (currentBeat ? ' ' : '') + sentence
      currentDuration += sentenceDuration
    }
  }
  
  if (currentBeat.trim()) {
    beats.push(currentBeat.trim())
  }
  
  return beats
}
