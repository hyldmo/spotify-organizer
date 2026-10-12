import { initTRPC, TRPCError } from '@trpc/server'
import type { Spotify } from './spotify'

export interface TRPCContext {
	db: D1Database
	spotify: Spotify
	/** The Spotify user ID, verified with Spotify. Null when the request's token didn't check out. */
	userId: string | null
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

// Pages doesn't set NODE_ENV for Functions, so tRPC would treat production as development and send stack traces.
const t = initTRPC.context<TRPCContext>().meta<McpMeta>().create({ isDev: false })

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.userId) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
	}
	return next({ ctx: { ...ctx, userId: ctx.userId } })
})
