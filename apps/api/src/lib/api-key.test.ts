import { createHash } from 'crypto'
import { describe, it, expect } from 'vitest'
import { generateApiKey } from './api-key.js'

describe('generateApiKey', () => {
  it('rawKey starts with af_live_', () => {
    const { rawKey } = generateApiKey()
    expect(rawKey.startsWith('af_live_')).toBe(true)
  })

  it('rawKey is unique on each call', () => {
    const { rawKey: key1 } = generateApiKey()
    const { rawKey: key2 } = generateApiKey()
    expect(key1).not.toBe(key2)
  })

  it('keyHash is 64 hex characters', () => {
    const { keyHash } = generateApiKey()
    expect(keyHash).toHaveLength(64)
    expect(keyHash).toMatch(/^[0-9a-f]+$/)
  })

  it('keyPrefix is first 16 chars of rawKey', () => {
    const { rawKey, keyPrefix } = generateApiKey()
    expect(keyPrefix).toHaveLength(16)
    expect(keyPrefix).toBe(rawKey.slice(0, 16))
  })

  it('same rawKey always produces same keyHash', () => {
    const { rawKey, keyHash } = generateApiKey()
    const rehash = createHash('sha256').update(rawKey).digest('hex')
    expect(rehash).toBe(keyHash)
  })
})
