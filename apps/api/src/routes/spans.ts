import { Hono } from 'hono';
import { requireApiKey } from '../middleware/api-key-auth.js';
import { db } from '@agentforge/db';

export const spansRouter = new Hono();

spansRouter.post('/:id/spans', requireApiKey, async(c) => {
    const runId = c.req.param('id');

    const projectId = c.get('projectId');

    const run = await db.run.findUnique( {where: {id: runId}} )

    if (!run || run.projectId !== projectId){
        return c.json({error: 'Not found'}, 404)
    }

    const body = await c.req.json()
    const spans = body.map((span) => ({
        id: span.id, 
        parentSpanId: span.parentSpanId,
        runId: runId, 
        name: span.name,
        type: span.type, 
        startedAt: span.startedAt, 
        completedAt: span.completedAt, 
        inputTokens: span.inputTokens, 
        outputTokens: span.outputTokens, 
        cost: span.cost, 
        metadata: span.metadata 
    }))

    const result = await db.span.createMany({
        data: spans
    })

    return c.json({result: result.count})
})