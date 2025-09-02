import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export interface Beat {
  id: string
  text: string
  startTime: number
  duration: number
  assets: Asset[]
  voiceUrl?: string
  voiceDuration?: number
}

export interface Asset {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  source: 'pexels' | 'ai' | 'upload'
  metadata: {
    width: number
    height: number
    alt?: string
    photographer?: string
  }
  score?: number
  selected: boolean
}

export interface Project {
  id: string
  title: string
  topic: string
  template: 'horror' | 'truecrime' | 'explainer' | 'history' | 'sports'
  tone: 'cinematic' | 'investigative' | 'friendly' | 'epic' | 'dry'
  targetDuration: number
  aspectRatio: '16:9' | '9:16' | '1:1'
  script?: string
  beats: Beat[]
  status: 'draft' | 'generating' | 'ready' | 'rendering' | 'complete'
  createdAt: Date
  updatedAt: Date
}

interface VideoStore {
  // State
  currentProject: Project | null
  projects: Project[]
  isGenerating: boolean
  currentStep: number
  aiAggressiveness: number

  // Actions
  createProject: (data: Partial<Project>) => void
  updateProject: (updates: Partial<Project>) => void
  generateScript: () => Promise<void>
  generateBeats: (script: string) => Promise<Beat[]>
  generateVoiceover: (beatId: string, text: string) => Promise<void>
  autoCompose: () => Promise<void>
  updateBeat: (beatId: string, updates: Partial<Beat>) => void
  selectAsset: (beatId: string, assetId: string) => void
  setAiAggressiveness: (value: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

export const useVideoStore = create<VideoStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        currentProject: null,
        projects: [],
        isGenerating: false,
        currentStep: 0,
        aiAggressiveness: 0.5,

        // Actions
        createProject: (data) => {
          const project: Project = {
            id: uuidv4(),
            title: data.title || 'Untitled Project',
            topic: data.topic || '',
            template: data.template || 'explainer',
            tone: data.tone || 'friendly',
            targetDuration: data.targetDuration || 540,
            aspectRatio: data.aspectRatio || '16:9',
            beats: [],
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
          }
          
          set((state) => ({
            currentProject: project,
            projects: [...state.projects, project],
          }))
        },

        updateProject: (updates) => {
          set((state) => {
            if (!state.currentProject) return state
            
            const updatedProject = {
              ...state.currentProject,
              ...updates,
              updatedAt: new Date(),
            }
            
            return {
              currentProject: updatedProject,
              projects: state.projects.map(p =>
                p.id === updatedProject.id ? updatedProject : p
              ),
            }
          })
        },

        generateScript: async () => {
          const { currentProject } = get()
          if (!currentProject) return

          set({ isGenerating: true })
          
          try {
            const response = await fetch('/api/script/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                topic: currentProject.topic,
                template: currentProject.template,
                tone: currentProject.tone,
                targetDuration: currentProject.targetDuration,
              }),
            })

            const { script } = await response.json()
            get().updateProject({ script })
          } catch (error) {
            console.error('Script generation failed:', error)
          } finally {
            set({ isGenerating: false })
          }
        },

        generateBeats: async (script: string) => {
          try {
            const response = await fetch('/api/script/beats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ script }),
            })

            const { beats } = await response.json()
            return beats.map((beat: any) => ({
              id: uuidv4(),
              text: beat.text,
              startTime: beat.startTime || 0,
              duration: beat.duration || 5,
              assets: [],
            }))
          } catch (error) {
            console.error('Beat generation failed:', error)
            return []
          }
        },

        generateVoiceover: async (beatId: string, text: string) => {
          try {
            const response = await fetch('/api/tts/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, beatId }),
            })
