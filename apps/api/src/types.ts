declare module 'hono' {
  interface ContextVariableMap {
    userId: string
    projectId: string
    apiKeyId: string
  }
}
