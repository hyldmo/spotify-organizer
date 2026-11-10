import { createHash } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { createTestHarness, type WorkerHandle } from 'wrangler'

const ORIGIN = 'https://mcp.test'
const CLIENT_REDIRECT = 'https://client.test/callback'
const CLIENT_ID = '4a3ae815c2a0443c824541a7aa94cfcc'

/** Stands in for accounts.spotify.com and api.spotify.com. Refresh tokens rotate, like Spotify's do for PKCE. */
const fakeSpotify = {
	challenge: '',
	generation: 0,
	accessToken: () => `spotify-access-${fakeSpotify.generation}`,
	refreshToken: () => `spotify-refresh-${fakeSpotify.generation}`,
	/** Tokens the web app holds after its own Spotify login. */
	webAppTokens: new Map([
		['ada-token', 'ada'],
		['bob-token', 'bob']
	])
}

function spotifyUser(authorization: string | undefined) {
	const token = authorization?.replace(/^Bearer /, '') ?? ''
	return token === fakeSpotify.accessToken() ? 'spotify-user' : fakeSpotify.webAppTokens.get(token)
}

const s256 = (value: string) => createHash('sha256').update(value).digest('base64url')

function send(res: ServerResponse, status: number, body: unknown) {
	res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body))
}

function issueTokens(res: ServerResponse) {
	fakeSpotify.generation++
	send(res, 200, {
		access_token: fakeSpotify.accessToken(),
		refresh_token: fakeSpotify.refreshToken(),
		expires_in: 3600,
		token_type: 'Bearer'
	})
}

const playlist = {
	name: 'Road trip',
	uri: 'spotify:playlist:37i9dQZF1DX0XUsuxWHRQd',
	public: false,
	collaborative: false,
	description: '',
	owner: { id: 'spotify-user', display_name: 'Ada' },
	snapshot_id: 'snapshot',
	items: { total: 12 }
}

async function handleSpotify(req: IncomingMessage, res: ServerResponse) {
	let raw = ''
	for await (const chunk of req) raw += chunk
	const { pathname } = new URL(req.url ?? '/', 'http://spotify')

	if (pathname === '/api/token') {
		const form = new URLSearchParams(raw)
		if (form.get('client_id') !== CLIENT_ID) return send(res, 400, { error: 'invalid_client' })
		const valid =
			form.get('grant_type') === 'authorization_code'
				? form.get('code') === 'spotify-code' &&
					form.get('redirect_uri') === `${ORIGIN}/callback` &&
					s256(form.get('code_verifier') ?? '') === fakeSpotify.challenge
				: form.get('refresh_token') === fakeSpotify.refreshToken()
		return valid ? issueTokens(res) : send(res, 400, { error: 'invalid_grant' })
	}

	const user = spotifyUser(req.headers.authorization)
	if (!user) return send(res, 401, { error: { status: 401, message: 'The access token expired' } })
	if (pathname === '/v1/me') return send(res, 200, { id: user })
	if (pathname === '/v1/me/playlists') return send(res, 200, { items: [playlist], total: 1, offset: 0 })
	const track = /^\/v1\/tracks\/(\w+)$/.exec(pathname)?.[1]
	if (track) {
		return send(res, 200, {
			type: 'track',
			name: `Song ${track}`,
			uri: `spotify:track:${track}`,
			duration_ms: 200_000,
			artists: [{ name: 'Band' }]
		})
	}
	send(res, 404, { error: { status: 404, message: 'Not found' } })
}

const spotifyServer = createServer((req, res) => void handleSpotify(req, res))
let harness: ReturnType<typeof createTestHarness>
let worker: WorkerHandle

beforeAll(async () => {
	await new Promise<void>(resolve => spotifyServer.listen(0, '127.0.0.1', resolve))
	const spotifyUrl = `http://127.0.0.1:${(spotifyServer.address() as AddressInfo).port}`
	harness = createTestHarness({
		workers: [
			{
				configPath: './test/wrangler.jsonc',
				vars: { SPOTIFY_ACCOUNTS_URL: spotifyUrl, SPOTIFY_API_URL: `${spotifyUrl}/v1` }
			}
		]
	})
	await harness.listen()
	// `harness.fetch` downgrades https URLs to http; the Worker handle keeps the scheme.
	worker = harness.getWorker()
	await worker.applyD1Migrations('DB')
})

afterAll(async () => {
	await harness?.close()
	spotifyServer.close()
})

const readJson = (response: Response): Promise<any> => response.json()

/** What a browser sends back after this response. */
function cookiesFrom(response: Response) {
	return response.headers
		.getSetCookie()
		.map(cookie => cookie.split(';')[0])
		.join('; ')
}

/** The web app's tRPC API, called the way @trpc/client calls it without batching. */
const webApi = {
	query: (token: string, procedure: string) =>
		worker.fetch(`${ORIGIN}/api/trpc/${procedure}`, { headers: { Authorization: `Bearer ${token}` } }),
	mutation: (token: string, procedure: string, input: unknown) =>
		worker.fetch(`${ORIGIN}/api/trpc/${procedure}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		})
}

function rpc(token: string, method: string, params: Record<string, unknown> = {}) {
	return worker.fetch(`${ORIGIN}/mcp`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			Accept: 'application/json, text/event-stream'
		},
		body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
	})
}

/** The JSON-RPC result from a JSON or SSE response. */
async function rpcResult(response: Response) {
	const body = await response.text()
	const data = body.split('\n').find(line => line.startsWith('data: '))
	return JSON.parse(data ? data.slice(6) : body).result
}

/** Discovery, registration and the consent page, as an MCP client and its user go through them. */
async function approveConsent() {
	const challenge = await worker.fetch(`${ORIGIN}/mcp`, { method: 'POST' })
	const metadataUrl = /resource_metadata="([^"]+)"/.exec(challenge.headers.get('WWW-Authenticate') ?? '')?.[1]
	const resource = await readJson(await worker.fetch(metadataUrl ?? ''))
	const issuer = resource.authorization_servers[0]
	const server = await readJson(await worker.fetch(`${issuer}/.well-known/oauth-authorization-server`))

	const registration = await worker.fetch(server.registration_endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_name: 'Test client',
			redirect_uris: [CLIENT_REDIRECT],
			token_endpoint_auth_method: 'none'
		})
	})
	const { client_id: clientId } = await readJson(registration)

	const verifier = 'client-verifier-0123456789-0123456789-0123456789'
	const authorize = new URL(server.authorization_endpoint)
	authorize.search = new URLSearchParams({
		response_type: 'code',
		client_id: clientId,
		redirect_uri: CLIENT_REDIRECT,
		state: 'client-state',
		code_challenge: s256(verifier),
		code_challenge_method: 'S256',
		resource: resource.resource
	}).toString()
	const consent = await worker.fetch(authorize, { redirect: 'manual' })
	const consentPage = await consent.text()

	const handle = /name="handle" value="([^"]+)"/.exec(consentPage)?.[1] ?? ''
	const toSpotify = await worker.fetch(`${ORIGIN}/authorize`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookiesFrom(consent) },
		body: new URLSearchParams({ handle, decision: 'allow' }),
		redirect: 'manual'
	})
	const spotifyAuthorize = new URL(toSpotify.headers.get('Location') ?? '')
	fakeSpotify.challenge = spotifyAuthorize.searchParams.get('code_challenge') ?? ''

	return {
		unauthenticatedStatus: challenge.status,
		consentPage,
		spotifyAuthorize,
		tokenEndpoint: server.token_endpoint,
		clientId,
		verifier,
		state: spotifyAuthorize.searchParams.get('state') ?? '',
		browserCookies: cookiesFrom(toSpotify)
	}
}

it('lets an MCP client connect through Spotify and call tools', async () => {
	const flow = await approveConsent()
	expect(flow.unauthenticatedStatus).toBe(401)
	expect(flow.consentPage).toContain('Test client')
	expect(flow.consentPage).toContain('client.test')
	expect(flow.spotifyAuthorize.searchParams.get('client_id')).toBe(CLIENT_ID)
	expect(flow.spotifyAuthorize.searchParams.get('redirect_uri')).toBe(`${ORIGIN}/callback`)

	const back = await worker.fetch(`${ORIGIN}/callback?code=spotify-code&state=${flow.state}`, {
		headers: { Cookie: flow.browserCookies },
		redirect: 'manual'
	})
	expect(back.status).toBe(302)
	const toClient = new URL(back.headers.get('Location') ?? '')
	expect(`${toClient.origin}${toClient.pathname}`).toBe(CLIENT_REDIRECT)
	expect(toClient.searchParams.get('state')).toBe('client-state')

	const token = (params: Record<string, string>) =>
		worker.fetch(flow.tokenEndpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ client_id: flow.clientId, ...params })
		})
	const tokens = await readJson(
		await token({
			grant_type: 'authorization_code',
			code: toClient.searchParams.get('code') ?? '',
			redirect_uri: CLIENT_REDIRECT,
			code_verifier: flow.verifier
		})
	)

	const initialize = await rpc(tokens.access_token, 'initialize', {
		protocolVersion: '2025-11-25',
		capabilities: {},
		clientInfo: { name: 'test', version: '1' }
	})
	expect(initialize.status).toBe(200)
	const { tools } = await rpcResult(await rpc(tokens.access_token, 'tools/list'))
	expect(tools.map((tool: { name: string }) => tool.name)).toEqual(
		expect.arrayContaining(['catalog_search', 'playlist_list', 'playlist_addItems', 'player_play'])
	)
	const listTool = tools.find((tool: { name: string }) => tool.name === 'playlist_list')
	expect(Object.keys(listTool.inputSchema.properties)).toEqual(['limit', 'offset'])
	expect(listTool.annotations).toMatchObject({ readOnlyHint: true })

	const listPlaylists = { name: 'playlist_list', arguments: {} }
	const listed = await rpcResult(await rpc(tokens.access_token, 'tools/call', listPlaylists))
	expect(JSON.parse(listed.content[0].text).items[0]).toMatchObject({
		name: 'Road trip',
		owner: 'Ada',
		visibility: 'private',
		itemCount: 12
	})

	// Spotify rotates its tokens on refresh, so this only passes if our refresh refreshed Spotify's too.
	const refreshed = await readJson(await token({ grant_type: 'refresh_token', refresh_token: tokens.refresh_token }))
	const afterRefresh = await rpcResult(await rpc(refreshed.access_token, 'tools/call', listPlaylists))
	expect(JSON.parse(afterRefresh.content[0].text).items[0].name).toBe('Road trip')

	// A skip the web app records for the same Spotify user shows up in the MCP tools.
	await webApi.mutation(fakeSpotify.accessToken(), 'stats.record', {
		kind: 'skip',
		contextUri: 'spotify:playlist:37i9dQZF1DX0XUsuxWHRQd',
		trackId: 'skippedtrack'
	})
	const mostSkipped = { name: 'stats_mostSkipped', arguments: { playlistId: '37i9dQZF1DX0XUsuxWHRQd' } }
	const skipped = await rpcResult(await rpc(refreshed.access_token, 'tools/call', mostSkipped))
	expect(JSON.parse(skipped.content[0].text)).toEqual([
		expect.objectContaining({ name: 'Song skippedtrack', uri: 'spotify:track:skippedtrack', skips: 1 })
	])
})

it("keeps each person's plays and skips to the Spotify user behind the token", async () => {
	const skip = { kind: 'skip', contextUri: 'spotify:playlist:shared', trackId: 'adastrack' }
	expect((await webApi.mutation('ada-token', 'stats.record', skip)).status).toBe(200)

	const ada = await readJson(await webApi.query('ada-token', 'stats.all'))
	expect(ada.result.data.skips).toEqual({ 'spotify:playlist:shared': { adastrack: 1 } })
	const bob = await readJson(await webApi.query('bob-token', 'stats.all'))
	expect(bob.result.data.skips).toEqual({})
	expect((await webApi.query('made-up-token', 'stats.all')).status).toBe(401)
})

it('refuses the Spotify callback in a browser that did not approve the consent page', async () => {
	const flow = await approveConsent()

	const replayed = await worker.fetch(`${ORIGIN}/callback?code=spotify-code&state=${flow.state}`, {
		redirect: 'manual'
	})
	expect(replayed.status).toBe(400)
	expect(replayed.headers.get('Location')).toBeNull()
})
