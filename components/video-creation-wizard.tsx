'use client'

import { useVideoStore } from '@/lib/store/video-store'
import { Slider } from '@/components/ui/slider'

const STEPS = [
  { title: 'Project', id: 'project' },
  { title: 'Script', id: 'script' },
  { title: 'Voice', id: 'voice' },
  { title: 'Scenes', id: 'scenes' },
  { title: 'Render', id: 'render' },
]

export function VideoCreationWizard() {
  const { currentProject, currentStep, nextStep, prevStep, isGenerating } = useVideoStore()

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Navigation */}
      <nav className="flex space-x-2 mb-8">
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
              index === currentStep
                ? 'bg-blue-600 text-white border-blue-600'
                : index < currentStep
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
            disabled
          >
            {step.title}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="bg-white rounded-xl border p-6 min-h-[600px]">
        {currentStep === 0 && <ProjectSetupStep />}
        {currentStep === 1 && <ScriptGenerationStep />}
        {currentStep === 2 && <VoiceGenerationStep />}
        {currentStep === 3 && <ScenesCompositionStep />}
        {currentStep === 4 && <RenderExportStep />}
      </div>
      
      {currentProject && (
        <div className="mt-4 text-sm text-gray-500">
          Project: {currentProject.title} • {currentProject.template} • {currentProject.tone}
        </div>
      )}
    </div>
  )
}

function ProjectSetupStep() {
  const { createProject, nextStep } = useVideoStore()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    createProject({
      title: formData.get('title') as string,
      topic: formData.get('topic') as string,
      template: formData.get('template') as any,
      tone: formData.get('tone') as any,
      targetDuration: parseInt(formData.get('targetDuration') as string),
      aspectRatio: formData.get('aspectRatio') as any,
    })
    
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Project Setup</h2>
        <p className="text-gray-600">Configure your AI video project</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Video Title</label>
            <input
              name="title"
              type="text"
              defaultValue="My Faceless Video"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., Five True Horror Stories..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <textarea
              name="topic"
              className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
              placeholder="Describe what your video should be about..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <select name="template" className="w-full border rounded-lg px-3 py-2" defaultValue="explainer">
              <option value="horror">Horror (True Stories)</option>
              <option value="truecrime">True Crime</option>
              <option value="explainer">Explainers (Interesting Facts)</option>
              <option value="history">History Mini-Docs</option>
              <option value="sports">Sports Data Stories</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tone</label>
            <select name="tone" className="w-full border rounded-lg px-3 py-2" defaultValue="friendly">
              <option value="cinematic">Cinematic & Suspenseful</option>
              <option value="investigative">Investigative & Matter-of-Fact</option>
              <option value="friendly">Friendly & Educational</option>
              <option value="epic">Epic & Inspirational</option>
              <option value="dry">Dry & Wry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Runtime (seconds)</label>
            <input
              name="targetDuration"
              type="number"
              defaultValue={540}
              className="w-full border rounded-lg px-3 py-2"
              min={60}
              max={1800}
            />
            <p className="text-xs text-gray-500 mt-1">8–12 minutes recommended</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
            <select name="aspectRatio" className="w-full border rounded-lg px-3 py-2" defaultValue="16:9">
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait/Mobile)</option>
              <option value="1:1">1:1 (Square)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium">
          Create Project & Continue
        </button>
      </div>
    </form>
  )
}

function ScriptGenerationStep() {
  const { currentProject, generateScript, generateBeats, updateProject, nextStep, prevStep, isGenerating } = useVideoStore()
  
  const handleGenerate = async () => {
    await generateScript()
    if (currentProject?.script) {
      const beats = await generateBeats(currentProject.script)
      updateProject({ beats })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Script Generation</h2>
        <p className="text-gray-600">Generate an intelligent script for your video</p>
      </div>

      {currentProject && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Project: {currentProject.title}</h3>
          <p className="text-sm text-gray-600">{currentProject.topic}</p>
          <div className="text-xs text-gray-500 mt-1">
            {currentProject.template} • {currentProject.tone} • {Math.floor(currentProject.targetDuration / 60)} min
          </div>
        </div>
      )}

      <div className="text-center py-12">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-8 py-3 rounded-lg font-medium text-lg ${
            isGenerating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Generating Script...
            </div>
          ) : (
            'Generate AI Script'
          )}
        </button>
      </div>

      {currentProject?.script && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Generated Script</h3>
              <div className="text-sm text-gray-500">
                {currentProject.script.split(' ').length} words • {Math.floor(currentProject.script.split(' ').length / 2.5)} sec estimated
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded text-sm max-h-64 overflow-y-auto">
              {currentProject.script}
            </div>
          </div>

          {currentProject.beats && currentProject.beats.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Script Beats ({currentProject.beats.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentProject.beats.map((beat, index) => (
                  <div key={beat.id} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="font-medium text-xs text-gray-500 mb-1">Beat {index + 1}</div>
                    <div>{beat.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        <button onClick={prevStep} className="px-6 py-2 border rounded-lg">
          Back
        </button>
        <button 
          onClick={nextStep} 
          disabled={!currentProject?.script}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
        >
          Continue to Voice
        </button>
      </div>
    </div>
  )
}

function VoiceGenerationStep() {
  const { currentProject, generateVoiceover, nextStep, prevStep, isGenerating } = useVideoStore()

  const handleGenerateAll = async () => {
    if (!currentProject?.beats) return
    
    for (const beat of currentProject.beats) {
      await generateVoiceover(beat.id, beat.text)
    }
  }

  const hasVoices = currentProject?.beats?.some(beat => beat.voiceUrl)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Voice Generation</h2>
        <p className="text-gray-600">Generate professional AI voiceovers</p>
      </div>

      {currentProject?.beats && (
        <>
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              {currentProject.beats.length} beats ready for voice generation
            </div>
            <button 
              onClick={handleGenerateAll}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-lg font-medium ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isGenerating ? 'Generating...' : 'Generate All Voices'}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {currentProject.beats.map((beat, index) => (
              <div key={beat.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm">Beat {index + 1}</div>
                  {beat.voiceUrl && (
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      Voice Ready ({beat.voiceDuration?.toFixed(1)}s)
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{beat.text}</p>
                {beat.voiceUrl && (
                  <audio controls className="w-full max-w-md">
                    <source src={beat.voiceUrl} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-between pt-6 border-t">
        <button onClick={prevStep} className="px-6 py-2 border rounded-lg">
          Back
        </button>
        <button onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          Continue to Scenes
        </button>
      </div>
    </div>
  )
}

function ScenesCompositionStep() {
  const { 
    currentProject, 
    autoCompose, 
    selectAsset, 
    aiAggressiveness, 
    setAiAggressiveness, 
    nextStep, 
    prevStep, 
    isGenerating 
  } = useVideoStore()

  const handleAutoCompose = async () => {
    await autoCompose()
  }

  const hasAssets = currentProject?.beats?.some(beat => beat.assets && beat.assets.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Intelligent Scene Composition</h2>
        <p className="text-gray-600">Auto-compose perfect b-roll with AI + stock assets</p>
      </div>

      {/* AI Aggressiveness Control */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold mb-1">AI Assist Aggressiveness</h3>
            <p className="text-sm text-gray-600">
              Controls stock vs AI generation balance
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">
              {Math.round(aiAggressiveness * 100)}%
            </div>
            <div className="text-xs text-gray-500">
              {aiAggressiveness < 0.3 ? 'Stock First' : 
               aiAggressiveness < 0.7 ? 'Balanced' : 'AI First'}
            </div>
          </div>
        </div>
        
        <Slider
          value={[aiAggressiveness]}
          onValueChange={([value]) => setAiAggressiveness(value)}
          max={1}
          min={0}
          step={0.1}
          className="w-full mb-4"
        />

        <button 
          onClick={handleAutoCompose}
          disabled={isGenerating || !currentProject?.beats}
          className={`w-full py-3 rounded-lg font-medium text-lg ${
            isGenerating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Auto-Composing Scenes...
            </div>
          ) : (
            'Auto-Compose All Scenes'
          )}
        </button>
      </div>

      {/* Assets Display */}
      {hasAssets && currentProject?.beats && (
        <div className="space-y-4">
          <h3 className="font-semibold">Generated Assets</h3>
          {currentProject.beats.map((beat, beatIndex) => (
            beat.assets && beat.assets.length > 0 && (
              <div key={beat.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="font-medium">Beat {beatIndex + 1}</span>
                    <div className="text-sm text-gray-500 mt-1">{beat.text.slice(0, 80)}...</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {beat.assets.length} assets
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {beat.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        asset.selected 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectAsset(beat.id, asset.id)}
                    >
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <img 
                          src={asset.thumbnailUrl} 
                          alt={asset.metadata.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NCA2OEw5NiA1Nkw5MiA2MEwxMDQgNDhMMTE2IDYwTDEwNCA3Mkw5NiA2NEw4NCA2OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                          }}
                        />
                      </div>
                      
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs px-2 py-1 rounded text-white font-medium ${
                          asset.source === 'ai' ? 'bg-purple-600' : 'bg-green-600'
                        }`}>
                          {asset.source === 'ai' ? 'AI' : 'Stock'}
                        </span>
                      </div>
                      
                      {asset.selected && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                            ✓
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                        <div className="text-xs">
                          Score: {(asset.score || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        <button onClick={prevStep} className="px-6 py-2 border rounded-lg">
          Back
        </button>
        <button onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          Continue to Render
        </button>
      </div>
    </div>
  )
}

function RenderExportStep() {
  const { currentProject, prevStep, reset } = useVideoStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Render & Export</h2>
        <p className="text-gray-600">Your AI video is ready for final processing</p>
      </div>

      {currentProject && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4">Project Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Title:</span> {currentProject.title}
            </div>
            <div>
              <span className="text-gray-500">Template:</span> {currentProject.template}
            </div>
            <div>
              <span className="text-gray-500">Duration:</span> {Math.floor(currentProject.targetDuration / 60)} minutes
            </div>
            <div>
              <span className="text-gray-500">Beats:</span> {currentProject.beats?.length || 0}
            </div>
            <div>
              <span className="text-gray-500">Assets:</span> {currentProject.beats?.reduce((acc, beat) => acc + (beat.assets?.length || 0), 0) || 0}
            </div>
            <div>
              <span className="text-gray-500">Status:</span> Ready for Render
            </div>
          </div>
        </div>
      )}

      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold mb-2">Video Rendering</h3>
        <p className="text-gray-600 mb-6">
          Your intelligent video composition is complete!<br/>
          Final rendering will be implemented in the next phase.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={prevStep} className="px-6 py-2 border rounded-lg">
            Back to Edit
          </button>
          <button 
            onClick={reset} 
            className="px-6 py-2 bg-green-600 text-white rounded-lg"
          >
            Start New Project
          </button>
        </div>
      </div>
    </div>
  )
}
