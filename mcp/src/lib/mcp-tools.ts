import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'
import type { AnyRouter } from '@trpc/server'
import { ZodDefault, ZodOptional, ZodType } from 'zod'
import { appRouter } from './router'
import type { McpMeta } from './trpc'

// tRPC→MCP derivation, the same as Macromaxxing's workers/functions/lib/mcp-tools.ts.

export function procedurePathToToolName(path: string): string {
	return path.replaceAll('.', '_')
}

/**
 * Derive MCP tool annotations from a tRPC procedure's path + type, allowing per-procedure `.meta()` overrides.
 *
 * Defaults:
 *   - `readOnlyHint`     ← procedure type (`query` → true, `mutation` → false)
 *   - `destructiveHint`  ← method name starts with `delete` or `remove` (mutations only)
 *   - `idempotentHint`   ← queries + `delete*`/`remove*`/`update*`/`set*`/`upsert*`/`save*`/`reorder*`
 *                          mutations. `create*`/`add*` are explicitly non-idempotent. Other mutations stay unset.
 *   - `openWorldHint`    ← true (every procedure calls Spotify)
 */
export function deriveAnnotations(
	procedurePath: string,
	type: 'query' | 'mutation' | 'subscription',
	meta: Omit<McpMeta, 'description'>
): ToolAnnotations {
	const isQuery = type === 'query'
	const method = procedurePath.split('.').at(-1) ?? ''
	const looksDestructive = !isQuery && /^(delete|remove)/.test(method)
	const looksIdempotent = !isQuery && /^(delete|remove|update|set|upsert|save|reorder)/.test(method)
	const looksNonIdempotent = !isQuery && /^(create|add)/.test(method)
	const idempotentDefault = isQuery || looksIdempotent ? true : looksNonIdempotent ? false : undefined

	return {
		readOnlyHint: meta.readOnly ?? isQuery,
		destructiveHint: meta.destructive ?? (isQuery ? false : looksDestructive),
		idempotentHint: meta.idempotent ?? idempotentDefault,
		openWorldHint: meta.openWorld ?? true
	}
}

export interface McpToolDef {
	name: string
	description: string
	/** The Zod schema from tRPC's `.input()`, unwrapped to a bare object, or undefined for no-input procedures. */
	zodSchema: ZodType | undefined
	procedurePath: string
	annotations: ToolAnnotations
}

/**
 * Strip `ZodOptional`/`ZodDefault` wrappers off a procedure's input schema. The MCP SDK only publishes the
 * properties of a bare object schema; a wrapped one is published as `{"type":"object","properties":{}}`, and
 * every argument becomes unreachable.
 */
export function unwrapInputSchema(schema: unknown): ZodType | undefined {
	let current = schema
	while (current instanceof ZodOptional || current instanceof ZodDefault) {
		current = current.unwrap()
	}
	return current instanceof ZodType ? current : undefined
}

/** Walk the tRPC router and extract procedures that have .meta({ description }) set */
export function extractMcpTools(router: AnyRouter): McpToolDef[] {
	const procedures = (router as any)._def.procedures as Record<string, any>
	const tools: McpToolDef[] = []

	for (const [path, procedure] of Object.entries(procedures)) {
		const meta = procedure._def?.meta as McpMeta | undefined
		if (!meta?.description) continue

		const inputs = procedure._def?.inputs as unknown[] | undefined
		tools.push({
			name: procedurePathToToolName(path),
			description: meta.description,
			zodSchema: unwrapInputSchema(inputs?.[0]),
			procedurePath: path,
			annotations: deriveAnnotations(path, procedure._def?.type, meta)
		})
	}

	return tools
}

let cachedTools: McpToolDef[] | null = null

export function getTools(): McpToolDef[] {
	cachedTools ??= extractMcpTools(appRouter)
	return cachedTools
}

/** JSON.stringify(undefined) is itself undefined — MCP requires content[].text to be a string. */
export function serializeToolResult(result: unknown): string {
	return result === undefined ? 'OK' : JSON.stringify(result, null, 2)
}
