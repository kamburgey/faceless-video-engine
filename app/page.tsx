'use client'

import { useState } from 'react'
import { Header } from '@/components/header'

export default function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setProgress([])
    setError(null)
    setResult(null)

    const formData = new FormData(e.target as HTMLFormElement)
    
    const projectData = {
      title: formData.get('title') as string,
      topic: formData.get('topic') as string,
      template: formData.get('template') as string,
      tone: formData.get('tone') as string,
      targetDuration: parseInt(formData.get('targetDuration') as string),
      aspectRatio: formData.get('aspectRatio') as string,
      aiAggressiveness: 0.5,
    }

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'progress') {
                setProgress(prev => [...prev, data.message])
              } else if (data.type === 'complete') {
                setResult(data.result)
                setIsGenerating(false)
              } else if (data.type === 'error') {
                setError(data.message)
                setIsGenerating(false)
              }
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to generate video')
      setIsGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {!isGenerating && !result && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">One-Click Video Generation</h1>
            <p className="text-xl text-gray-600">
              Describe your video idea. AI handles everything else.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          {!isGenerating && !result ? (
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Video Title</label>
                    <input
                      name="title"
                      type="text"
                      defaultValue="My AI Video"
                      className="w-full border-2 rounded-lg px-4 py-3 focus:border-blue-500 outline-none"
                      placeholder="e.g., The Mystery of Ancient Civilizations"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Topic & Content</label>
                    <textarea
                      name="topic"
                      className="w-full border-2 rounded-lg px-4 py-3 h-32 focus:border-blue-500 outline-none resize-none"
                      placeholder="Describe what your video should cover. Be as detailed or general as you like..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Video Type</label>
                    <select name="template" className="w-full border-2 rounded-lg px-4 py-3 focus:border-blue-500 outline-none" defaultValue="explainer">
                      <option value="horror">Horror Stories</option>
                      <option value="truecrime">True Crime</option>
                      <option value="explainer">Educational/Explainer</option>
                      <option value="history">History Documentary</option>
                      <option value="sports">Sports Analysis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tone</label>
                    <select name="tone" className="w-full border-2 rounded-lg px-4 py-3 focus:border-blue-500 outline-none" defaultValue="friendly">
                      <option value="cinematic">Cinematic & Dramatic</option>
                      <option value="investigative">Professional & Analytical</option>
                      <option value="friendly">Friendly & Conversational</option>
                      <option value="epic">Epic & Inspirational</option>
                      <option value="dry">Witty & Dry</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <select name="targetDuration" className="w-full border-2 rounded-lg px-4 py-3 focus:border-blue-500 outline-none" defaultValue="300">
                        <option value="180">3 minutes</option>
                        <option value="300">5 minutes</option>
                        <option value="600">10 minutes</option>
                        <option value="900">15 minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Format</label>
                      <select name="aspectRatio" className="w-full border-2 rounded-lg px-4 py-3 focus:border-blue-500 outline-none" defaultValue="16:9">
                        <option value="16:9">YouTube (16:9)</option>
                        <option value="9:16">TikTok/Shorts (9:16)</option>
                        <option value="1:1">Instagram (1:1)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
                >
                  Generate My Video
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  AI will handle script, voice, visuals, and editing automatically
                </p>
              </div>
            </form>
          ) : isGenerating ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto">
                <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Generating Your Video</h2>
                <p className="text-gray-600">AI is working its magic...</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {progress.map((step, index) => (
                    <div key={index} className="flex items-center text-sm mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      {step}
                    </div>
                  ))}
                  {progress.length === 0 && (
                    <div className="text-gray-500 text-sm">Initializing...</div>
                  )}
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎬</div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Video Generated Successfully!</h2>
                <p className="text-gray-600">Your AI-powered video is ready</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">{result.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>Script: {result.wordCount} words</div>
                  <div>Beats: {result.beatsCount}</div>
                  <div>Assets: {result.assetsCount}</div>
                  <div>Duration: ~{Math.floor(result.estimatedDuration / 60)} min</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Another Video
                </button>
              </div>
            </div>
          ) : null}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-medium">Generation Failed</div>
              <div className="text-red-600 text-sm mt-1">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
