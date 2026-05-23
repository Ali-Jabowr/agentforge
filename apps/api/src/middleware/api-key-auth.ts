import { createHash } from 'crypto'
import type { Context, Next } from 'hono'
import { db } from '@agentforge/db'


export async function requireApiKey(c: Context, next: Next) {
    const apiKeyHeader = c.req.header('Authorization')
    if (!apiKeyHeader || !apiKeyHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    const apiKey = apiKeyHeader.slice(7)
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex')

    const apiKeyRecord = await db.apiKey.findUnique({
        where: { keyHash: apiKeyHash },
    })

    if (!apiKeyRecord) {
        return c.json({ error: 'Unauthorized' }, 401)
    }
    
    c.set('userId', apiKeyRecord.userId)
    c.set('projectId', apiKeyRecord.projectId)
    c.set('apiKeyId', apiKeyRecord.id)

    db.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() },
    }).catch(console.error)

    await next()
}