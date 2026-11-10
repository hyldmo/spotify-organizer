import type { Env } from '../src/env'
import worker from '../src/index'

// public/_routes.json sends only the Worker's own paths here. Pages serves everything else from `dist`.
export const onRequest: PagesFunction<Env> = ctx =>
	worker.fetch(ctx.request, ctx.env, {
		waitUntil: promise => ctx.waitUntil(promise),
		passThroughOnException: () => ctx.passThroughOnException(),
		// The OAuth provider writes `props` and `auth` onto this object for the MCP route.
		props: {}
	} as ExecutionContext)
