import { z } from "zod";
import { ToolDefinition } from "./llm/types.js";

export type Tool<TSchema extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>> = {
    name: string
    description: string
    schema: TSchema
    handler: (input: z.infer<TSchema>) => Promise<string>

}

export function defineTool<TSchema extends z.ZodObject<z.ZodRawShape>>(config: Tool<TSchema>): Tool<TSchema> {
    return config 
}

export function toolToDefinition(tool: Tool<z.ZodObject<z.ZodRawShape>>): ToolDefinition {
    const name = tool.name
    const description = tool.description
    const jsonSchema = z.toJSONSchema(tool.schema) as { properties: Record<string, unknown>, required?: string[] }
    return {
        name,
        description,
        inputSchema: {
            type: 'object',
            properties: jsonSchema.properties,
            required: jsonSchema.required
        }
    }
}