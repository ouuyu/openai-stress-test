"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Play, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getRandomTopic } from "@/lib/article-topics"

interface ConfigPanelProps {
  isRunning: boolean
  setIsRunning: (running: boolean) => void
  setMetrics: (metrics: any) => void
}

const STORAGE_KEY = "openai-stress-test-config"

export function ConfigPanel({ isRunning, setIsRunning, setMetrics }: ConfigPanelProps) {
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1")
  const [apiKey, setApiKey] = useState("")
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [requestCount, setRequestCount] = useState("10")
  const [concurrency, setConcurrency] = useState("5")
  const [loadingModels, setLoadingModels] = useState(false)
  const { toast } = useToast()

  const [abortController, setAbortController] = useState<AbortController | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const config = JSON.parse(saved)
        if (config.baseUrl) setBaseUrl(config.baseUrl)
        if (config.apiKey) setApiKey(config.apiKey)
        if (config.requestCount) setRequestCount(config.requestCount)
        if (config.concurrency) setConcurrency(config.concurrency)
      } catch (e) {
        console.error("Failed to load config from localStorage", e)
      }
    }
  }, [])

  useEffect(() => {
    const config = { baseUrl, apiKey, requestCount, concurrency }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [baseUrl, apiKey, requestCount, concurrency])

  const fetchModels = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter your API key first",
        variant: "destructive",
      })
      return
    }

    setLoadingModels(true)
    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiKey }),
      })

      if (!response.ok) throw new Error("Failed to fetch models")

      const data = await response.json()
      setModels(data.models)
      toast({
        title: "Success",
        description: `Loaded ${data.models.length} models`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch models. Check your API key and base URL.",
        variant: "destructive",
      })
    } finally {
      setLoadingModels(false)
    }
  }

  const startTest = async () => {
    if (!selectedModel) {
      toast({
        title: "Error",
        description: "Please select a model first",
        variant: "destructive",
      })
      return
    }

    const controller = new AbortController()
    setAbortController(controller)
    setIsRunning(true)

    const totalRequests = Number.parseInt(requestCount)
    const maxConcurrency = Number.parseInt(concurrency)
    const startTime = Date.now()

    const metricsState = {
      total: totalRequests,
      completed: 0,
      successful: 0,
      failed: 0,
      avgResponseTime: 0,
      rpm: 0,
      startTime,
      requests: [] as any[],
    }

    setMetrics(metricsState)

    const makeRequest = async (index: number) => {
      if (controller.signal.aborted) return

      const requestStartTime = Date.now()
      const topic = getRandomTopic()

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: "user",
                content: `请写一篇关于以下主题的深度文章（1000-1500字）：\n\n${topic}\n\n要求：\n1. 内容详实，观点明确\n2. 结构清晰，包含引言、主体和结论\n3. 使用具体案例和数据支持论点\n4. 语言流畅，逻辑严密`,
              },
            ],
            max_tokens: 2000,
            stream: true,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullContent = ""

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n").filter((line) => line.trim() !== "")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    fullContent += content
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        }

        const responseTime = Date.now() - requestStartTime

        metricsState.completed++
        metricsState.successful++
        metricsState.requests.push({
          success: true,
          responseTime,
          timestamp: Date.now(),
          content: fullContent.substring(0, 100),
        })

        updateMetrics(metricsState, startTime)
      } catch (error: any) {
        if (error.name === "AbortError") return

        const responseTime = Date.now() - requestStartTime
        metricsState.completed++
        metricsState.failed++
        metricsState.requests.push({
          success: false,
          responseTime,
          timestamp: Date.now(),
          error: error.message,
        })

        updateMetrics(metricsState, startTime)
      }
    }

    const updateMetrics = (state: any, startTime: number) => {
      const totalTime = state.requests.reduce((sum: number, req: any) => sum + req.responseTime, 0)
      state.avgResponseTime = state.requests.length > 0 ? Math.round(totalTime / state.requests.length) : 0

      const elapsedMinutes = (Date.now() - startTime) / 60000
      state.rpm = elapsedMinutes > 0 ? state.completed / elapsedMinutes : 0

      setMetrics({ ...state })
    }

    const executeWithConcurrency = async () => {
      const queue = Array.from({ length: totalRequests }, (_, i) => i)
      const executing: Promise<void>[] = []

      for (const index of queue) {
        const promise = makeRequest(index)
        executing.push(promise)

        if (executing.length >= maxConcurrency) {
          await Promise.race(executing)
          executing.splice(
            executing.findIndex((p) => p === promise),
            1,
          )
        }
      }

      await Promise.all(executing)
    }

    try {
      await executeWithConcurrency()
      toast({
        title: "Test Complete",
        description: `Completed ${metricsState.successful} successful requests`,
      })
    } catch (error) {
      console.error("Test error:", error)
    } finally {
      setIsRunning(false)
      setAbortController(null)
    }
  }

  const stopTest = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    setIsRunning(false)
    toast({
      title: "Test Stopped",
      description: "Stress test has been stopped",
    })
  }

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="space-y-4 p-0">
        <div className="space-y-2">
          <Label htmlFor="baseUrl" className="text-foreground text-xs font-medium">
            Base URL
          </Label>
          <Input
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            disabled={isRunning}
            className="bg-secondary border-border text-foreground h-9 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-foreground text-xs font-medium">
            API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            disabled={isRunning}
            className="bg-secondary border-border text-foreground font-mono h-9 text-sm"
          />
        </div>

        <Button
          onClick={fetchModels}
          disabled={loadingModels || isRunning || !apiKey}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm"
        >
          {loadingModels && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          Fetch Models
        </Button>

        {models.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="model" className="text-foreground text-xs font-medium">
              Model
            </Label>
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isRunning}>
              <SelectTrigger className="bg-secondary border-border text-foreground h-9 text-sm">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {models.map((model) => (
                  <SelectItem key={model} value={model} className="text-popover-foreground text-sm">
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="requestCount" className="text-foreground text-xs font-medium">
              Requests
            </Label>
            <Input
              id="requestCount"
              type="number"
              value={requestCount}
              onChange={(e) => setRequestCount(e.target.value)}
              min="1"
              max="1000"
              disabled={isRunning}
              className="bg-secondary border-border text-foreground h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concurrency" className="text-foreground text-xs font-medium">
              Concurrency
            </Label>
            <Input
              id="concurrency"
              type="number"
              value={concurrency}
              onChange={(e) => setConcurrency(e.target.value)}
              min="1"
              max="50"
              disabled={isRunning}
              className="bg-secondary border-border text-foreground h-9 text-sm"
            />
          </div>
        </div>

        {!isRunning ? (
          <Button
            onClick={startTest}
            disabled={!selectedModel}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm"
          >
            <Play className="mr-2 h-3.5 w-3.5" />
            Start Test
          </Button>
        ) : (
          <Button onClick={stopTest} variant="destructive" className="w-full h-9 text-sm">
            <Square className="mr-2 h-3.5 w-3.5" />
            Stop Test
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
