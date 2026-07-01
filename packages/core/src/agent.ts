import { Tool, toolToDefinition } from "./tools.js";
import { LLMAdapter, Message, ToolUseBlock, TextBlock } from "./llm/types.js";


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
            }
            throw new Error('Max iterations reached')
        }
    }
}