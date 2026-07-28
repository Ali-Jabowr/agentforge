import 'dotenv/config'
import { Hono } from 'hono'
import { tracesRouter } from './routes/traces.js'
import { apiKeysRouter } from './routes/api-keys.js'
import { spansRouter } from './routes/spans.js'

const app = new Hono()

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))
app.route('/v1/traces', tracesRouter)
app.route('/v1/api-keys', apiKeysRouter)
app.route('/v1/runs', spansRouter)

export default app
