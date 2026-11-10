import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { CfWorkerJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/cfworker'
import { MCP_INSTRUCTIONS } from './mcp-instructions'
import { getTools, serializeToolResult } from './mcp-tools'
import { appRouter } from './router'
import type { TRPCContext } from './trpc'

/** Traverse a nested caller object by dot-separated path to get the procedure function */
function traverseCaller(caller: any, path: string): (input?: unknown) => Promise<unknown> {
	let current = caller
	for (const part of path.split('.')) {
		current = current[part]
	}
	return current
}

/** Handle an MCP request. Creates a fresh McpServer + transport per request (stateless). */
export async function handleMcpRequest(request: Request, ctx: TRPCContext): Promise<Response> {
	const server = new McpServer(
		{ name: 'spotify-organiser', version: '1.0.0' },
		{ jsonSchemaValidator: new CfWorkerJsonSchemaValidator(), instructions: MCP_INSTRUCTIONS }
	)
	const caller = appRouter.createCaller(ctx)

	for (const tool of getTools()) {
		const call = async (args?: unknown) => {
			try {
				const result = await traverseCaller(caller, tool.procedurePath)(args)
				return { content: [{ type: 'text' as const, text: serializeToolResult(result) }] }
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : 'Unknown error'
				return { content: [{ type: 'text' as const, text: message }], isError: true }
			}
		}
		const config = { description: tool.description, annotations: tool.annotations }
		if (tool.zodSchema) {
			server.registerTool(tool.name, { ...config, inputSchema: tool.zodSchema }, call)
		} else {
			server.registerTool(tool.name, config, () => call())
		}
	}

	const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
	await server.connect(transport)
	return transport.handleRequest(request)
}
