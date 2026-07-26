import { Tool, toolToDefinition } from "./tools.js";
import { LLMAdapter, Message, ToolUseBlock, TextBlock, ToolResultBlock } from "./llm/types.js";


type AgentConfig = {
    adapter: LLMAdapter
    model: string
    tools?: Tool[]
    system?: string
    maxIterations?: number
}


export function createAgent(config: AgentConfig) {
    const maxIterations = config.maxIterations ?? 10
    const toolMap = Object.fromEntries(config.tools?.map(t => [t.name, t]) ?? [])

    return {
        async run(input: string): Promise<string> {
            const messages: Message[] = [{ role: 'user', content: input }]

            for (let i = 0; i < maxIterations; i++) {
                const response = await config.adapter.chat({
                    model: config.model,
                    system: config.system,
                    messages,
                    tools: config.tools?.map(toolToDefinition)
                })
                messages.push({ role: 'assistant', content: response.content}) 

                switch (response.stopReason) {
                    case 'end_turn':
                        return response.content
                            .filter((block): block is TextBlock => block.type === 'text') 
                            .map(block => block.text)
                            .join('\n')
                    
                    case 'tool_use':{
                        const toolCalls = response.content
                                .filter((block): block is ToolUseBlock => block.type === 'tool_use')
                        
                        const results: ToolResultBlock[] = []
                        for(const call of toolCalls){
                            const tool = toolMap[call.name]
                            try{
                                if (!tool){
                                    throw new Error(`${call.name} there is no such a tool to call!`)
                                }
                                const result = await tool.handler(call.input)
                                results.push({type: 'tool_result', toolUseId: call.id, content: result})
                            }
                            catch(err){
                                const message = err instanceof Error ? err.message : String(err)
                                results.push({
                                    type: 'tool_result', 
                                    toolUseId: call.id,
                                    content: message,
                                    isError: true
                                })
                            }
                        }
                        messages.push({role: 'user', content: results})
                        break
                    }
                    case 'max_tokens':
                        throw new Error('Max tokens reached')

                }

            }
            throw new Error('Max iterations reached')
        }
    }
}