import type { AgentForgeConfig, TraceData, TraceResult } from './types.js'

export class AgentForge {
  private readonly apiKey: string
  private readonly baseUrl: string

  private constructor(config: AgentForgeConfig) {
    if (!config.apiKey) throw new Error('AgentForge: apiKey is required')
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl ?? 'https://api.agentforge.dev'
  }

  static init(config: AgentForgeConfig): AgentForge {
    return new AgentForge(config)
  }

  async trace(data: TraceData): Promise<TraceResult> {
    const res = await fetch(`${this.baseUrl}/v1/traces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error(`AgentForge trace failed: ${res.status} ${await res.text()}`)
    }

    return res.json() as Promise<TraceResult>
  }
}
