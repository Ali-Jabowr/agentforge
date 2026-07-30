import { Tool, toolToDefinition } from "./tools.js";
import { LLMAdapter, Message, ToolUseBlock, TextBlock, ToolResultBlock } from "./llm/types.js";
import { z } from 'zod'


type AgentConfig = {
    adapter: LLMAdapter
    model: string
    tools?: Tool[]
    system?: string
    maxIterations?: number,
    apiKey?: string,
    baseUrl?: string,
    RunName?: string
}

type SpanInput = {
    id: string
    runId: string
    parentSpanId?: string
    name: string
    type: string
    startedAt: Date 
    completedAt: Date
    inputTokens?: number
    outputTokens?: number
    cost?: number
    metadata?: Record<string, unknown> 
}


export function createAgent(config: AgentConfig) {
    const maxIterations = config.maxIterations ?? 10
    const toolMap = Object.fromEntries(config.tools?.map(t => [t.name, t] as const) ?? [])

    return {
        async run(input: string): Promise<string> {
            let runId: string | undefined

            if(config.apiKey && config.baseUrl){
                const url = `${config.baseUrl}/v1/traces`
                try{
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${config.apiKey}`
                        },
                        body: JSON.stringify({name: config.RunName ?? 'agent-run'})
                    })

                    if(!response.ok){
                        throw new Error(`Request failed: ${response.status}`)
                    }

                    const data = z.object({ runId: z.string() }).parse(await response.json())
                    runId = data.runId

                }catch(err){
                    console.error('AgentForge: failed to start trace', err)
                }
            }

            const messages: Message[] = [{ role: 'user', content: input }]

            const spans: SpanInput[] = []
            try {
            for (let i = 0; i < maxIterations; i++) {
                const spanStart = new Date()
                const response = await config.adapter.chat({
                    model: config.model,
                    system: config.system,
                    messages,
                    tools: config.tools?.map(toolToDefinition)
                })
                const spanEnd = new Date()

                if(runId){
                    spans.push({
                        id: crypto.randomUUID(),
                        runId,
                        parentSpanId: undefined,
                        name: config.model,
                        type: 'LLM_CALL',
                        startedAt: spanStart,
                        completedAt: spanEnd,
                        inputTokens: response.usage.inputTokens,
                        outputTokens: response.usage.outputTokens
                    })
                }
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
                            const spanStart = new Date()
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
                            const spanEnd = new Date()

                            if (runId){
                                spans.push({
                                    id: crypto.randomUUID(),
                                    runId,
                                    parentSpanId: undefined,
                                    name: call.name,
                                    type: 'TOOL_CALL',
                                    startedAt: spanStart,
                                    completedAt: spanEnd
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
            } finally {
                if (runId && spans.length > 0) {
                    try {
                        await fetch(`${config.baseUrl}/v1/runs/${runId}/spans`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${config.apiKey}`
                            },
                            body: JSON.stringify(spans)
                        })
                    } catch (err) {
                        console.error('AgentForge: failed to send spans', err)
                    }
                }
            }
        }

    }
}