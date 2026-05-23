import { Hono } from 'hono';
import { requireApiKey } from '../middleware/api-key-auth.js';
import { db } from '@agentforge/db';

export const tracesRouter = new Hono();

tracesRouter.post('/', requireApiKey, async (c) => {
    const body = await c.req.json();

    const projectId = c.get('projectId');
    const apiKeyId = c.get('apiKeyId');

    const run = await db.run.create({
      data: {
        name: body.name,
        projectId,
        apiKeyId,
        status: 'RUNNING',
      }
    })

    return c.json({ runId: run.id }, 201);
});