import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { tracesRouter } from './routes/traces.js'

const app = new Hono()

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))
app.route('/v1/traces', tracesRouter)

const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, () => {
  console.log(`AgentForge API running on http://localhost:${port}`)
})
