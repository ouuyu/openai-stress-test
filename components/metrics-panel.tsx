"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Clock, Zap, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface MetricsPanelProps {
  metrics: any
  isRunning: boolean
}

export function MetricsPanel({ metrics, isRunning }: MetricsPanelProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (metrics?.requests) {
      const data = metrics.requests.map((req: any, index: number) => ({
        index: index + 1,
        responseTime: req.responseTime,
        timestamp: req.timestamp,
      }))
      setChartData(data)
    }
  }, [metrics])

  if (!metrics) {
    return (
      <Card className="bg-card border-border h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Configure your test and click Start to begin</p>
        </CardContent>
      </Card>
    )
  }

  const progress = (metrics.completed / metrics.total) * 100
  const successRate = metrics.completed > 0 ? (metrics.successful / metrics.completed) * 100 : 0
  const elapsedTime = ((Date.now() - metrics.startTime) / 1000).toFixed(1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-foreground">{metrics.completed}</p>
                <p className="text-xs text-muted-foreground">of {metrics.total}</p>
              </div>
              <TrendingUp className="w-7 h-7 text-chart-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Successful</p>
                <p className="text-xl font-bold text-success">{metrics.successful}</p>
                <p className="text-xs text-muted-foreground">{successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-xl font-bold text-destructive">{metrics.failed}</p>
                <p className="text-xs text-muted-foreground">{(100 - successRate).toFixed(1)}%</p>
              </div>
              <XCircle className="w-7 h-7 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Response</p>
                <p className="text-xl font-bold text-foreground">{metrics.avgResponseTime}ms</p>
                <p className="text-xs text-muted-foreground">{metrics.rpm.toFixed(0)} RPM</p>
              </div>
              <Clock className="w-7 h-7 text-chart-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-foreground">Progress</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {isRunning ? "Running" : "Completed"} • {elapsedTime}s
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{progress.toFixed(1)}% complete</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Response Time</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Real-time latency per request</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="index" stroke="oklch(0.65 0 0)" tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }} />
              <YAxis
                stroke="oklch(0.65 0 0)"
                tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
                label={{ value: "ms", angle: -90, position: "insideLeft", fill: "oklch(0.65 0 0)", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0 0)",
                  border: "1px solid oklch(0.24 0 0)",
                  borderRadius: "0.5rem",
                  color: "oklch(0.98 0 0)",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="responseTime" stroke="oklch(0.65 0.20 250)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {metrics.requests && metrics.requests.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Request Log</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Latest requests (last 10)</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {metrics.requests
                .slice(-10)
                .reverse()
                .map((req: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-secondary border border-border"
                  >
                    <div className="flex items-center gap-2.5">
                      {req.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                      <span className="text-xs text-foreground font-mono">
                        Request #{metrics.requests.length - index}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{req.responseTime}ms</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(req.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
