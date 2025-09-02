'use client'

import { useVideoStore } from '@/lib/store/video-store'

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
    <div className="container mx-auto px-6 py-8 max-w-4xl">
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
      <div className="bg-white rounded-xl border p-6 min-h-[500px]">
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
  const { currentProject, generateScript, nextStep, prevStep, isGenerating } = useVideoStore()
  
  const handleGenerate = async () => {
    await generateScript()
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
        </div>
      )}

      <div className="text-center py-12">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-8 py-3 rounded-lg font-medium ${
            isGenerating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isGenerating ? 'Generating Script...' : '🤖 Generate AI Script'}
        </button>
      </div>

      {currentProject?.script && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Generated Script</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono max-h-64 overflow-y-auto">
            {currentProject.script}
          </div>
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
          Continue
        </button>
      </div>
    </div>
  )
}

function VoiceGenerationStep() {
  const { nextStep, prevStep } = useVideoStore()

  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Voice Generation</h2>
      <p className="text-gray-600 mb-8">Coming soon - Professional AI voiceovers!</p>
      <div className="flex gap-4 justify-center">
        <button onClick={prevStep} className="px-6 py-2 border rounded-lg">Back</button>
        <button onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Continue</button>
      </div>
    </div>
  )
}

function ScenesCompositionStep() {
  const { nextStep, prevStep } = useVideoStore()

  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Scenes & Assets</h2>
      <p className="text-gray-600 mb-8">Coming soon - Intelligent b-roll selection!</p>
      <div className="flex gap-4 justify-center">
        <button onClick={prevStep} className="px-6 py-2 border rounded-lg">Back</button>
        <button onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Continue</button>
      </div>
    </div>
  )
}

function RenderExportStep() {
  const { prevStep, reset } = useVideoStore()

  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">🎬 Render & Export</h2>
      <p className="text-gray-600 mb-8">Coming soon - Professional video rendering!</p>
      <div className="flex gap-4 justify-center">
        <button onClick={prevStep} className="px-6 py-2 border rounded-lg">Back</button>
        <button onClick={reset} className="px-6 py-2 bg-green-600 text-white rounded-lg">Start New Project</button>
      </div>
    </div>
  )
}
