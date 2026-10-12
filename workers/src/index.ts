import { OAuthProvider, type OAuthResourceContext } from '@cloudflare/workers-oauth-provider'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import type { Env } from './env'
import { askConsent, authErrorResponse, decide, exchangeTokens, finishSignIn, oauthHelpers } from './lib/auth'
import { handleMcpRequest } from './lib/mcp'
import { appRouter } from './lib/router'
import { Spotify, type SpotifyAccess, spotifyUserId } from './lib/spotify'
import type { TRPCContext } from './lib/trpc'

type HonoEnv = { Bindings: Env }

// The provider only lets requests with a valid access token through to these routes.
const api = new Hono<HonoEnv>()

// Stateless server: no session → no server-initiated SSE stream to serve. GET would otherwise open a stream that
// never writes, which trips Cloudflare's hang detector. Spec-compliant clients fall back to POST-only JSON-RPC.
api.on(['GET', 'DELETE'], '/mcp', c =>
	c.json(
		{ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed (stateless server)' }, id: null },
		405,
		{ Allow: 'POST' }
	)
)

api.post('/mcp', c => {
	const { props } = c.executionCtx as unknown as OAuthResourceContext<SpotifyAccess>
	return handleMcpRequest(c.req.raw, {
		db: c.env.DB,
		spotify: new Spotify(c.env, props.accessToken),
		userId: props.userId
	})
})

const app = new Hono<HonoEnv>()

// The web app's API. It sends the user's own Spotify access token, which spotifyUserId() checks with Spotify.
app.use(
	'/api/trpc/*',
	trpcServer({
		router: appRouter,
		endpoint: '/api/trpc',
		createContext: async (_opts, c) => {
			const token = /^Bearer (.+)$/.exec(c.req.header('Authorization') ?? '')?.[1]
			const env = c.env as Env
			return {
				db: env.DB,
				spotify: new Spotify(env, token ?? ''),
				userId: token ? await spotifyUserId(env, token) : null
			} satisfies TRPCContext
		}
	})
)

app.get('/authorize', c => askConsent(c.req.raw, oauthHelpers(c.env)))
app.post('/authorize', c => decide(c.req.raw, c.env, oauthHelpers(c.env)))
app.get('/callback', c => finishSignIn(c.req.raw, c.env, oauthHelpers(c.env)))

app.onError((error, c) => {
	const response = authErrorResponse(error)
	if (response) return response
	console.error(error)
	return c.text('Internal Server Error', 500)
})

// A grant expires after 60 days without a refresh. Each refresh moves that out again.
const GRANT_IDLE_TTL = 60 * 24 * 60 * 60

// Tokens are bound to `<origin>/mcp`, so each origin the Worker answers on (workers.dev, a custom domain,
// 127.0.0.1 in dev) needs its own provider.
const providers = new Map<string, OAuthProvider<Env>>()

function providerFor(origin: string) {
	let provider = providers.get(origin)
	if (!provider) {
		provider = new OAuthProvider<Env>({
			apiRoute: '/mcp',
			apiHandler: api,
			defaultHandler: app,
			authorizeEndpoint: '/authorize',
			tokenEndpoint: '/token',
			clientRegistrationEndpoint: '/register',
			clientIdMetadataDocumentEnabled: true,
			// Cursor signs in through a `cursor://` redirect URI.
			allowPrivateUseRedirectUris: true,
			resourceMetadata: {
				resource: `${origin}/mcp`,
				authorization_servers: [origin],
				resource_name: 'Spotify Organiser'
			},
			refreshTokenTTL: GRANT_IDLE_TTL,
			refreshTokenIdleTTL: GRANT_IDLE_TTL,
			tokenExchangeCallback: exchangeTokens
		})
		providers.set(origin, provider)
	}
	return provider
}

export default {
	fetch: (request, env, ctx) => providerFor(new URL(request.url).origin).fetch(request, env, ctx)
} satisfies ExportedHandler<Env>
