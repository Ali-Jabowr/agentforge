'use server'

import { auth } from '@clerk/nextjs/server'
import { createHash, randomBytes } from 'crypto'
import { db } from '@agentforge/db'

export async function createApiKey(name: string) {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw new Error('Unauthorized')

  const raw = randomBytes(32).toString('hex')
  const rawKey = `af_live_${raw}`
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, 16)

  const user = await db.user.upsert({
    where: { clerkId },
    create: { clerkId, email: `${clerkId}@agentforge.com` },
    update: {},
  })

  let project = await db.project.findFirst({ where: { userId: user.id } })
  if (!project) {
    project = await db.project.create({
      data: {
        userId: user.id,
        name: 'Default Project',
        slug: `default-${user.id.slice(0, 8)}`,
      },
    })
  }

  await db.apiKey.create({
    data: { name, keyHash, keyPrefix, userId: user.id, projectId: project.id },
  })

  return { rawKey }
}
