import { Hono } from 'hono'
import { generateApiKey } from '../lib/api-key.js'
import { requireAuth } from '../middleware/auth.js'
import { db } from '@agentforge/db'

export const apiKeysRouter = new Hono()

apiKeysRouter.post('/', requireAuth, async (c) => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()

    const clerkId = c.get('userId') as string
    console.log('User ID:', clerkId)
    
    const { name } = await c.req.json<{ name: string }>()

    const user = await db.user.upsert({
        where: { clerkId },
        create: { clerkId, email: `${clerkId}@agentforge.com` },
        update: { },
    })

    let project = await db.project.findFirst({
        where: { userId: user.id, name },
    })

    if (!project) {
        project = await db.project.create({
            data: { userId: user.id, name: 'Default Project', slug: `default-${user.id.slice(0, 8)}` },
        })
    }

    await db.apiKey.create({
        data: {
            name,
            keyHash,
            keyPrefix,
            userId: user.id,
            projectId: project.id,
        }
    })

    console.log('Creating API key:', rawKey, keyHash, keyPrefix)
    return c.json({ key: rawKey }, 201)
})