import 'dotenv/config'
import { Hono } from 'hono'
import { tracesRouter } from './routes/traces.js'
import { apiKeysRouter } from './routes/api-keys.js'

const app = new Hono()

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))
app.route('/v1/traces', tracesRouter)
app.route('/v1/api-keys', apiKeysRouter)

export default app
