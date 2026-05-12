import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import workerEntry from './dist/server/index.js'

const app = new Hono()

// Разрешаем раздавать статику
app.use('/assets/*', serveStatic({ root: './dist/client' }))
app.use('/*', serveStatic({ root: './dist/client' }))

// Все остальные запросы отдаем сгенерированному worker entry
app.all('*', async (c) => {
  const env = process.env
  // Создаем контекст выполнения, похожий на cloudflare
  const executionContext = {
    waitUntil: (promise) => {},
    passThroughOnException: () => {}
  }

  try {
    const response = await workerEntry.fetch(c.req.raw, env, executionContext)
    return response
  } catch (error) {
    console.error('Render request failed', error)
    return c.text('Internal Server Error', 500)
  }
})

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

console.log(`Starting Node.js server on port ${port}...`)
serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
})
