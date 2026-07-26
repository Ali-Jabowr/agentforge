import { describe, it, expect, vi } from "vitest"
import { createAgent } from "./agent.js"
import { defineTool } from "./tools.js"
import { z } from "zod"
import type { LLMAdapter, ChatResponse, Message } from "./llm/types.js"

describe("createAgent().run()", () => {
    it("returns the final text on end_turn with no tool calls", async () => {
        const fakeAdapter: LLMAdapter = {
            async chat(){
                return{
                    stopReason: 'end_turn',
                    content: [{
                        type: 'text',
                        text: 'This is my first test',
                    }],
                    usage: {
                        inputTokens: 32,
                        outputTokens: 64
                    }
                }
            }
        }
        const result = await createAgent({adapter: fakeAdapter, model: 'fake', tools:[]})
                        .run('les test this')
        expect(result).toBe('This is my first test')
    })

    it("executes a tool call and feeds the result back before returning", async () => {
        const testingTool = defineTool({
            name: 'get_time',
            description: 'Returns the current time',
            schema: z.object({timezone: z.string()}),
            handler: vi.fn(async (input) => {
                return `it's noon in ${input.timezone}`
            })
        })

        let callCount = 0

        const fakeAdapter: LLMAdapter = {
            async chat(){
                callCount++
                if (callCount === 1){
                    return{
                        stopReason: 'tool_use',
                        content: [
                            {
                                type: 'tool_use',
                                id: 'call_1',
                                name: testingTool.name,
                                input: {
                                    timezone: 'UTC'
                                }
                            }
                        ],
                        usage:{
                            inputTokens: 32,
                            outputTokens: 32
                        }
                    }
                }
                return {
                    stopReason: 'end_turn',
                    content: [{
                        type: 'text',
                        text: 'exceed limits'
                    }],
                    usage:{
                        inputTokens: 32,
                        outputTokens: 32
                    }
                }
            }
        }

        const result = await createAgent({adapter: fakeAdapter, model: 'fake', tools: [testingTool]})
                        .run('what time is it')

        expect(result).toBe('exceed limits')
        expect(testingTool.handler).toHaveBeenCalledWith({ timezone: 'UTC' })
    })

    it("recovers when the model calls an unknown tool name", async () => {
        let callCount = 0
        let secondCallMessages: Message[] = []

        const fakeAdapter: LLMAdapter = {
            async chat(request){
                callCount++
                if (callCount === 1){
                    return {
                        stopReason: 'tool_use',
                        content: [
                            { type: 'tool_use', id: 'call_1', name: 'ghost_tool', input: {} }
                        ],
                        usage: { inputTokens: 10, outputTokens: 5 }
                    }
                }
                secondCallMessages = JSON.parse(JSON.stringify(request.messages))
                return {
                    stopReason: 'end_turn',
                    content: [{ type: 'text', text: 'recovered' }],
                    usage: { inputTokens: 10, outputTokens: 5 }
                }
            }
        }

        const result = await createAgent({adapter: fakeAdapter, model: 'fake', tools: []})
                        .run('call a tool that does not exist')

        expect(result).toBe('recovered')
        const lastMessage = secondCallMessages[secondCallMessages.length - 1]
        expect(lastMessage.content).toEqual([
            { type: 'tool_result', toolUseId: 'call_1', content: 'ghost_tool there is no such a tool to call!', isError: true }
        ])
    })

    it("recovers when a tool handler throws", async () => {
        const brokenTool = defineTool({
            name: 'broken',
            description: 'Always fails',
            schema: z.object({}),
            handler: async () => {
                throw new Error('boom')
            }
        })

        let callCount = 0
        let secondCallMessages: Message[] = []

        const fakeAdapter: LLMAdapter = {
            async chat(request){
                callCount++
                if (callCount === 1){
                    return {
                        stopReason: 'tool_use',
                        content: [
                            { type: 'tool_use', id: 'call_1', name: 'broken', input: {} }
                        ],
                        usage: { inputTokens: 10, outputTokens: 5 }
                    }
                }
                secondCallMessages = JSON.parse(JSON.stringify(request.messages))
                return {
                    stopReason: 'end_turn',
                    content: [{ type: 'text', text: 'recovered from handler error' }],
                    usage: { inputTokens: 10, outputTokens: 5 }
                }
            }
        }

        const result = await createAgent({adapter: fakeAdapter, model: 'fake', tools: [brokenTool]})
                        .run('call the broken tool')

        expect(result).toBe('recovered from handler error')
        const lastMessage = secondCallMessages[secondCallMessages.length - 1]
        expect(lastMessage.content).toEqual([
            { type: 'tool_result', toolUseId: 'call_1', content: 'boom', isError: true }
        ])
    })

    it("throws when max_tokens is hit", async () => {
        const fakeAdapter: LLMAdapter = {
            async chat(): Promise<ChatResponse> {
                return {
                    stopReason: 'max_tokens',
                    content: [],
                    usage: { inputTokens: 10, outputTokens: 5 }
                }
            }
        }

        await expect(
            createAgent({adapter: fakeAdapter, model: 'fake', tools: []}).run('write me a novel')
        ).rejects.toThrow('Max tokens reached')
    })

    it("throws after maxIterations tool_use rounds with no end_turn", async () => {
        const loopingTool = defineTool({
            name: 'loop',
            description: 'Always gets called again',
            schema: z.object({}),
            handler: async () => 'ok'
        })

        const fakeAdapter: LLMAdapter = {
            async chat(): Promise<ChatResponse> {
                return {
                    stopReason: 'tool_use',
                    content: [
                        { type: 'tool_use', id: 'call_1', name: 'loop', input: {} }
                    ],
                    usage: { inputTokens: 10, outputTokens: 5 }
                }
            }
        }

        await expect(
            createAgent({adapter: fakeAdapter, model: 'fake', tools: [loopingTool], maxIterations: 2}).run('never stop')
        ).rejects.toThrow('Max iterations reached')
    })
})
