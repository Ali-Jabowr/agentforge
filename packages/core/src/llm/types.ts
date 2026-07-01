
export type TextBlock = {
    type: 'text'
    text: string
}

export type ToolUseBlock = {
    type: 'tool_use'
    id: string
    name: string
    input: Record<string, unknown>
}

export type ToolResultBlock = {
    type: 'tool_result'
    toolUseId: string
    content: string 
    isError?: boolean
}

export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock

export type Message = {
    role: 'user' | 'assistant'
    content: string | ContentBlock[]
}

export type ToolDefinition = { 
    name: string
    description: string
    inputSchema: {
        type: 'object'
        properties: Record<string, unknown>
        required?: string[]
    }
}

export type ChatRequest = {
    model: string
    system?: string
    messages: Message[]
    tools?: ToolDefinition[]
    maxTokens?: number 
}

export type ChatResponse = {
    content: ContentBlock[]
    stopReason: 'max_tokens' | 'end_turn' | 'tool_use'
    usage: {
      inputTokens: number
      outputTokens: number
    }
}

export interface LLMAdapter {
    chat(request: ChatRequest): Promise<ChatResponse>
} 