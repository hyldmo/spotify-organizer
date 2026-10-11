import { initTRPC } from '@trpc/server'
import type { Spotify } from './spotify'

export interface TRPCContext {
	spotify: Spotify
}

export interface McpMeta {
	description: string
	/** Override the default `readOnlyHint` (defaults to `true` for queries, `false` for mutations). */
	readOnly?: boolean
	/** Override the default `destructiveHint` (defaults to `true` for `delete*`/`remove*` mutations). */
	destructive?: boolean
	/** Override the default `idempotentHint` (see `deriveAnnotations` in mcp-tools.ts). */
	idempotent?: boolean
	/** Override the default `openWorldHint` (defaults to `true`: every procedure calls Spotify). */
	openWorld?: boolean
}

const t = initTRPC.context<TRPCContext>().meta<McpMeta>().create()

export const router = t.router
export const procedure = t.procedure
