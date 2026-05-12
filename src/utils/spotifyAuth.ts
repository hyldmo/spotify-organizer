import { CLIENT_ID, REDIRECT_URI } from '~/consts'
import { Scopes } from '~/types'
import { sleep } from '~/utils/sleep'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize'
const VERIFIER_KEY = 'spotify_pkce_verifier'
const REAUTH_KEY = 'spotify_reauth_in_progress'

const scopes = [
	Scopes.PLAYLIST_READ_PRIVATE,
	Scopes.PLAYLIST_MODIFY_PRIVATE,
	Scopes.PLAYLIST_MODIFY_PUBLIC,
	Scopes.USER_LIBRARY_READ,
	Scopes.USER_LIBRARY_MODIFY,
	Scopes.STREAMING,
	Scopes.USER_READ_PLAYBACK_POSITION,
	Scopes.USER_READ_CURRENTLY_PLAYING,
	Scopes.USER_READ_PLAYBACK_STATE,
	Scopes.USER_MODIFY_PLAYBACK_STATE
]

export interface TokenResponse {
	access_token: string
	refresh_token: string
	expires_in: number
	token_type: string
	scope: string
}

function base64urlEncode (buffer: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}

function randomVerifier (): string {
	const bytes = new Uint8Array(64)
	crypto.getRandomValues(bytes)
	return base64urlEncode(bytes.buffer)
}

async function sha256 (input: string): Promise<ArrayBuffer> {
	return crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
}

export async function loginLink (): Promise<string> {
	const verifier = randomVerifier()
	sessionStorage.setItem(VERIFIER_KEY, verifier)
	const challenge = base64urlEncode(await sha256(verifier))

	const params = new URLSearchParams({
		client_id: CLIENT_ID,
		response_type: 'code',
		redirect_uri: REDIRECT_URI,
		scope: scopes.join(' '),
		code_challenge_method: 'S256',
		code_challenge: challenge,
		state: window.location.pathname
	})
	return `${AUTHORIZE_ENDPOINT}?${params}`
}

/**
 * Silently re-authenticate by bouncing through Spotify's authorize endpoint.
 * When the user's Spotify session is still alive (the common case for an app
 * that's already been granted access) this redirects straight back to us with a
 * fresh `?code=` — no consent screen, no visible login page — so a dead refresh
 * token can be recovered without the user clicking anything.
 *
 * Guarded against redirect loops: callers MUST check {@link reauthInProgress}
 * first and fall back to a normal logout if a bounce is already underway. The
 * flag is cleared by {@link finishReauth} once a code exchange succeeds.
 */
export async function reauthenticate (): Promise<void> {
	sessionStorage.setItem(REAUTH_KEY, String(Date.now()))
	window.location.href = await loginLink()
}

export function reauthInProgress (): boolean {
	return sessionStorage.getItem(REAUTH_KEY) != null
}

export function finishReauth (): void {
	sessionStorage.removeItem(REAUTH_KEY)
}

export async function exchangeCodeForToken (code: string): Promise<TokenResponse> {
	const verifier = sessionStorage.getItem(VERIFIER_KEY)
	if (!verifier) throw new Error('Missing PKCE verifier — restart login')

	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		code,
		redirect_uri: REDIRECT_URI,
		client_id: CLIENT_ID,
		code_verifier: verifier
	})

	const res = await fetch(TOKEN_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	})
	if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`)

	sessionStorage.removeItem(VERIFIER_KEY)
	return res.json()
}

/**
 * Spotify definitively rejected the refresh token — the session is dead and
 * callers should log out. Only thrown for 4xx responses; 5xx server hiccups
 * (see {@link refreshAccessToken}) are retried and ultimately surface as a
 * plain `Error` so callers treat them as transient and keep the session.
 */
export class RefreshTokenRejected extends Error {
	constructor (public status: number, body: string) {
		super(`Refresh token rejected (${status}): ${body}`)
	}
}

const REFRESH_RETRIES = 3
const REFRESH_BACKOFF_MS = 500

export async function refreshAccessToken (refreshToken: string): Promise<TokenResponse> {
	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		client_id: CLIENT_ID
	})

	// Network errors (fetch rejects) bubble as-is — the next call can retry.
	// 4xx → RefreshTokenRejected (token is dead, callers should log out).
	// 5xx → retry with backoff; Spotify's token endpoint flakes intermittently
	//   (`500 {"error":"server_error","error_description":"Failed to remove token"}`).
	//   If it keeps failing we throw a plain Error: transient, NOT a logout.
	for (let attempt = 0; ; attempt++) {
		const res = await fetch(TOKEN_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body
		})
		if (res.ok) return res.json()

		const text = await res.text()
		if (res.status < 500) throw new RefreshTokenRejected(res.status, text)
		if (attempt >= REFRESH_RETRIES - 1) throw new Error(`Spotify token endpoint error (${res.status}): ${text}`)
		await sleep(REFRESH_BACKOFF_MS * 2 ** attempt)
	}
}

export function storeTokens (tokens: TokenResponse) {
	localStorage.setItem('token', tokens.access_token)
	localStorage.setItem('refresh_token', tokens.refresh_token)
}

export function clearTokens () {
	localStorage.removeItem('token')
	localStorage.removeItem('refresh_token')
}
