export interface AgentForgeConfig {
  apiKey: string
  baseUrl?: string
}

export interface TraceData {
  name: string
  [key: string]: unknown
}

export interface TraceResult {
  id: string
}
