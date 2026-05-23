import { createHash, randomBytes } from 'crypto'

export function generateApiKey() {
    const raw = randomBytes(32).toString('hex')
    const rawKey = `af_live_${raw}`

    const keyHash = createHash('sha256').update(rawKey).digest('hex')
    const keyPrefix = rawKey.slice(0, 16)

    return { rawKey, keyHash, keyPrefix }
}