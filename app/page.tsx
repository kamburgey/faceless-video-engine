'use client'

import { VideoCreationWizard } from '@/components/video-creation-wizard'
import { Header } from '@/components/header'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <VideoCreationWizard />
    </main>
  )
}
