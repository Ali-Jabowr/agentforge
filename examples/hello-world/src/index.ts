import 'dotenv/config'
import { AgentForge } from '@agentforge/sdk'
const apiKey = process.env.AGENTFORGE_API_KEY
if (!apiKey) throw new Error('AGENTFORGE_API_KEY is required')

const client = AgentForge.init({
  apiKey,
  baseUrl: process.env.AGENTFORGE_BASE_URL ?? 'http://localhost:3001',
})

const result = await client.trace({ name: 'hello-world', message: 'First trace!' })
console.log('Trace created:', result)
