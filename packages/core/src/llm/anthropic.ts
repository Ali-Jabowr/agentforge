import Anthropic from '@anthropic-ai/sdk'
import { LLMAdapter, ChatRequest, ChatResponse, ContentBlock } from './types.js'

export class AnthropicAdapter implements LLMAdapter {
    private client: Anthropic

    constructor(apiKey: string) {
        this.client = new Anthropic({apiKey})
    }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        const params = toAnthropicParams(request)
        const response = await this.client.messages.create(params)
        return fromAnthropicResponse(response)
    }
}


function toAnthropicParams(request: ChatRequest){
    const model = request.model
    const system = request.system
    const messages = request.messages
    const max_tokens = request.maxTokens ?? 8192

    const mappedMessages = messages.map(message => ({
        role: message.role,
        content: typeof message.content === 'string'
            ? message.content
            : message.content.map(mapContentBlock)
    }))

    return {
        model,
        system,
        max_tokens: max_tokens,
        messages: mappedMessages,
        tools: request.tools ? request.tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.inputSchema
        })) : undefined
    }
}

function fromAnthropicResponse(response: Anthropic.Message): ChatResponse {
    const content = response.content.map(block => {
        switch (block.type) {
            case 'text': return { type: 'text', text: block.text }
            case 'tool_use': return { type: 'tool_use', id: block.id, name: block.name, input: block.input} 
            default: {
                throw new Error('Unreachable')
            }
        }
   }) as ContentBlock[]
    const stopReason = response.stop_reason as ChatResponse['stopReason']
    const usage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
    }

    return {
        content,
        stopReason,
        usage   
    }
   
}



function mapContentBlock(block: ContentBlock){
    switch (block.type) {
        case 'text': return { type: 'text' as const , text: block.text }
        case 'tool_use': return { type: 'tool_use' as const, id: block.id, name: block.name, input: block.input} 
        case 'tool_result': return { type: 'tool_result' as const, tool_use_id: block.toolUseId, content: block.content, is_error: block.isError }
        default: {
            const _exhaustive: never = block
            throw new Error('Unreachable')
        }
    }
}
