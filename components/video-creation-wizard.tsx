'use client'

import { useState } from 'react'

const STEPS = [
  { title: 'Project', id: 'project' },
  { title: 'Script', id: 'script' },
  { title: 'Voice', id: 'voice' },
  { title: 'Scenes', id: 'scenes' },
  { title: 'Render', id: 'render' },
]

export function VideoCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [project, setProject] = useState({
    title: '',
    topic: '',
    template: 'explainer',
    tone: 'friendly',
    targetDuration: 540,
    aspectRatio: '16:9'
  })

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

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
        {currentStep === 0 && (
          <ProjectSetupStep 
            project={project}
            setProject={setProject}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 1 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Script Generation</h2>
            <p className="text-gray-600 mb-8">Coming soon - AI script generation!</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleBack} className="px-6 py-2 border rounded-lg">
                Back
              </button>
              <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                Continue
              </button>
            </div>
          </div>
        )}

        {currentStep > 1 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">{STEPS[currentStep].title}</h2>
            <p className="text-gray-600 mb-8">This step is under construction!</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleBack} className="px-6 py-2 border rounded-lg">
                Back
              </button>
              {currentStep < STEPS.length - 1 && (
                <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                  Continue
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectSetupStep({ project, setProject, onNext }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Project Setup</h2>
        <p className="text-gray-600">Configure your video project settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Video Title</label>
            <input
              type="text"
              value={project.title}
              onChange={(e) => setProject({...project, title: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., Five True Horror Stories..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <textarea
              value={project.topic}
              onChange={(e) => setProject({...project, topic: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
              placeholder="Describe what your video should be about..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <select
              value={project.template}
              onChange={(e) => setProject({...project, template: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            >
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
            <select
              value={project.tone}
              onChange={(e) => setProject({...project, tone: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            >
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
              type="number"
              value={project.targetDuration}
              onChange={(e) => setProject({...project, targetDuration: parseInt(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2"
              min={60}
              max={1800}
            />
            <p className="text-xs text-gray-500 mt-1">8–12 minutes recommended</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
            <select
              value={project.aspectRatio}
              onChange={(e) => setProject({...project, aspectRatio: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait/Mobile)</option>
              <option value="1:1">1:1 (Square)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <button 
          type="submit" 
          className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Create Project & Continue
        </button>
      </div>
    </form>
  )
}
