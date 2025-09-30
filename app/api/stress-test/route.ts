import type { NextRequest } from "next/server"
import { getRandomTopic } from "@/lib/article-topics"

export async function POST(request: NextRequest) {
  const { baseUrl, apiKey, model, requestCount, concurrency } = await request.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const metrics = {
        total: requestCount,
        completed: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        rpm: 0,
        startTime: Date.now(),
        requests: [] as any[],
      }

      const sendUpdate = () => {
        const data = `data: ${JSON.stringify(metrics)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      const makeRequest = async () => {
        const startTime = Date.now()
        const topic = getRandomTopic()

        try {
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "user",
                  content: `Write a comprehensive, detailed article about: ${topic}. The article should be well-structured with clear sections, in-depth analysis, and approximately 1000-1500 words. Include relevant examples, current trends, and future implications.`,
                },
              ],
              max_tokens: 2000,
              stream: true,
            }),
          })

          if (response.ok && response.body) {
            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            // Read the stream to completion
            while (true) {
              const { done } = await reader.read()
              if (done) break
            }
          }

          const responseTime = Date.now() - startTime
          const success = response.ok

          metrics.completed++
          if (success) {
            metrics.successful++
          } else {
            metrics.failed++
          }

          metrics.requests.push({
            success,
            responseTime,
            timestamp: Date.now(),
          })

          // Calculate average response time
          const totalTime = metrics.requests.reduce((sum, req) => sum + req.responseTime, 0)
          metrics.avgResponseTime = Math.round(totalTime / metrics.requests.length)

          // Calculate RPM
          const elapsedMinutes = (Date.now() - metrics.startTime) / 60000
          metrics.rpm = elapsedMinutes > 0 ? metrics.completed / elapsedMinutes : 0

          sendUpdate()
        } catch (error) {
          metrics.completed++
          metrics.failed++
          metrics.requests.push({
            success: false,
            responseTime: Date.now() - startTime,
            timestamp: Date.now(),
          })
          sendUpdate()
        }
      }

      // Execute requests with concurrency control
      const batches = Math.ceil(requestCount / concurrency)
      for (let i = 0; i < batches; i++) {
        const batchSize = Math.min(concurrency, requestCount - i * concurrency)
        const promises = Array(batchSize)
          .fill(null)
          .map(() => makeRequest())
        await Promise.all(promises)
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
