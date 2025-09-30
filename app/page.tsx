"use client"

import { useState } from "react"
import { ConfigPanel } from "@/components/config-panel"
import { MetricsPanel } from "@/components/metrics-panel"
import { Activity } from "lucide-react"

export default function Home() {
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-80 border-r border-border bg-card/50 backdrop-blur-sm flex-shrink-0 overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">API Stress Test</h1>
              <p className="text-xs text-muted-foreground">Configuration</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <ConfigPanel isRunning={isRunning} setIsRunning={setIsRunning} setMetrics={setMetrics} />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Performance Metrics</h2>
            <p className="text-sm text-muted-foreground">Real-time monitoring and analysis</p>
          </div>
        </header>
        <div className="p-6">
          <MetricsPanel metrics={metrics} isRunning={isRunning} />
        </div>
      </main>
    </div>
  )
}
