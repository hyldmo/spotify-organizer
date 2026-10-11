import { OAuthError } from '@cloudflare/workers-oauth-provider'
import type { Env } from '../env'

const SCOPES = [
	'playlist-read-private',
	'playlist-read-collaborative',
	'playlist-modify-private',
	'playlist-modify-public',
	'user-library-read',
	'user-library-modify',
	'user-read-playback-state',
	'user-modify-playback-state',
	'user-read-currently-playing',
	'user-read-recently-played'
]

const accountsUrl = (env: Env) => env.SPOTIFY_ACCOUNTS_URL ?? 'https://accounts.spotify.com'
const apiUrl = (env: Env) => env.SPOTIFY_API_URL ?? 'https://api.spotify.com/v1'

/** What the MCP handler gets as `ctx.props` on every request. */
export interface SpotifyAccess {
	userId: string
	accessToken: string
}

/** What a grant keeps between refreshes. */
export interface SpotifyGrant {
	userId: string
	refreshToken: string
}

/** What sign-in stores until the client's code exchange splits it into the two shapes above. */
export type SpotifySession = SpotifyAccess & SpotifyGrant & { expiresAt: number }

interface TokenResponse {
	access_token: string
	refresh_token?: string
	expires_in: number
}

/** Sign-in failed in a way the user should read about in the browser. */
export class SignInError extends Error {}

function base64url(bytes: ArrayBuffer | Uint8Array) {
	return btoa(String.fromCharCode(...new Uint8Array(bytes)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}

export function createVerifier() {
	return base64url(crypto.getRandomValues(new Uint8Array(32)))
}

export async function authorizeUrl(env: Env, options: { redirectUri: string; state: string; verifier: string }) {
	const challenge = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(options.verifier))
	const params = new URLSearchParams({
		client_id: env.SPOTIFY_CLIENT_ID,
		response_type: 'code',
		redirect_uri: options.redirectUri,
		scope: SCOPES.join(' '),
		state: options.state,
		code_challenge_method: 'S256',
		code_challenge: base64url(challenge)
	})
	return `${accountsUrl(env)}/authorize?${params}`
}

// Spotify Organiser's app is a public client: PKCE, no client secret.
function requestToken(env: Env, params: Record<string, string>) {
	return fetch(`${accountsUrl(env)}/api/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ ...params, client_id: env.SPOTIFY_CLIENT_ID })
	})
}

export async function signIn(
	env: Env,
	options: { code: string; verifier: string; redirectUri: string }
): Promise<SpotifySession> {
	const response = await requestToken(env, {
		grant_type: 'authorization_code',
		code: options.code,
		redirect_uri: options.redirectUri,
		code_verifier: options.verifier
	})
	if (!response.ok) throw new SignInError(`Spotify sign-in failed (${response.status}). Try again.`)
	const tokens = (await response.json()) as TokenResponse
	if (!tokens.refresh_token) throw new SignInError('Spotify did not return a refresh token. Try again.')

	const me = await fetch(`${apiUrl(env)}/me`, { headers: { Authorization: `Bearer ${tokens.access_token}` } })
	if (me.status === 403) {
		throw new SignInError(
			'Spotify refused this account. Spotify Organiser runs in Spotify development mode, so its owner must add your Spotify account to the app first.'
		)
	}
	if (!me.ok) throw new SignInError(`Spotify sign-in failed (${me.status}). Try again.`)
	const { id } = (await me.json()) as { id: string }

	return {
		userId: id,
		accessToken: tokens.access_token,
		refreshToken: tokens.refresh_token,
		expiresAt: Date.now() + tokens.expires_in * 1000
	}
}

/**
 * Runs inside the token endpoint, so failures are OAuth errors. `invalid_grant` makes the provider revoke the
 * grant and the client sign in again. Network errors, 429 and 5xx are `temporarily_unavailable`, which keeps it.
 */
export async function refreshAccess(env: Env, grant: SpotifyGrant): Promise<TokenResponse> {
	let response: Response
	try {
		response = await requestToken(env, { grant_type: 'refresh_token', refresh_token: grant.refreshToken })
	} catch {
		throw new OAuthError('temporarily_unavailable', {
			description: 'Spotify could not be reached',
			statusCode: 503
		})
	}
	if (response.ok) return response.json()
	if (response.status === 429) {
		throw new OAuthError('temporarily_unavailable', {
			description: 'Spotify is rate limiting token refreshes',
			statusCode: 429,
			headers: { 'Retry-After': response.headers.get('Retry-After') ?? '30' }
		})
	}
	// Any other 4xx means Spotify will never accept this refresh token.
	if (response.status < 500) {
		throw new OAuthError('invalid_grant', { description: 'Spotify access was revoked. Connect again.' })
	}
	throw new OAuthError('temporarily_unavailable', {
		description: `Spotify token refresh failed (${response.status})`,
		statusCode: 503
	})
}

type Query = Record<string, string | number | boolean | undefined>

interface SpotifyErrorBody {
	error?: { message?: string; reason?: string }
}

/** A Spotify Web API client for one request, with the signed-in user's access token. */
export class Spotify {
	constructor(
		private readonly env: Env,
		private readonly accessToken: string
	) {}

	get<T>(path: string, query?: Query) {
		return this.request<T>('GET', path, query)
	}

	post<T>(path: string, query?: Query, body?: unknown) {
		return this.request<T>('POST', path, query, body)
	}

	put<T>(path: string, query?: Query, body?: unknown) {
		return this.request<T>('PUT', path, query, body)
	}

	delete<T>(path: string, query?: Query, body?: unknown) {
		return this.request<T>('DELETE', path, query, body)
	}

	private async request<T>(method: string, path: string, query: Query = {}, body?: unknown): Promise<T> {
		const url = new URL(`${apiUrl(this.env)}/${path}`)
		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined) url.searchParams.set(key, String(value))
		}
		const headers = new Headers({ Authorization: `Bearer ${this.accessToken}` })
		if (body !== undefined) headers.set('Content-Type', 'application/json')

		const response = await fetch(url, {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body)
		})
		// Player and library writes answer 200 or 204 with an empty or non-JSON body.
		const text = await response.text()
		let json: unknown
		try {
			json = text ? JSON.parse(text) : undefined
		} catch {
			json = undefined
		}
		if (response.ok) return json as T
		throw new Error(errorMessage(response, json as SpotifyErrorBody | undefined))
	}
}

function errorMessage(response: Response, body: SpotifyErrorBody | undefined) {
	// Our access token expires before Spotify's, so a 401 here means the user revoked access.
	if (response.status === 401) {
		return 'Spotify rejected this session. If it keeps happening, reconnect Spotify Organiser in your AI app.'
	}
	if (response.status === 429) {
		return `Spotify rate limit reached. Try again in ${response.headers.get('Retry-After') ?? 'a few'} seconds.`
	}
	const message = body?.error?.message ?? response.statusText
	if (body?.error?.reason === 'NO_ACTIVE_DEVICE') {
		return `${message}. Ask the user to open Spotify on a device, or pass a device_id from get_devices.`
	}
	if (body?.error?.reason === 'PREMIUM_REQUIRED') return `${message}. Playback control needs Spotify Premium.`
	return `Spotify error ${response.status}: ${message}`
}
