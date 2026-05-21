import { Hono } from 'hono'

export const tracesRouter = new Hono()

// POST /v1/traces — create a trace (Phase 1: stub, auth + DB wired in Step 7-8)
tracesRouter.post('/', async (c) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json()
  // TODO Phase 1 Step 8: validate API key against DB, write Run row
  console.log('Trace received:', body)

  return c.json({ id: crypto.randomUUID() }, 201)
})
