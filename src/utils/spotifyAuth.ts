import { CLIENT_ID, REDIRECT_URI } from '~/consts'
import { Scopes } from '~/types'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize'
const VERIFIER_KEY = 'spotify_pkce_verifier'

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

export class RefreshTokenRejected extends Error {
	constructor (public status: number, body: string) {
		super(`Refresh token rejected (${status}): ${body}`)
	}
}

export async function refreshAccessToken (refreshToken: string): Promise<TokenResponse> {
	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		client_id: CLIENT_ID
	})

	// Network errors (fetch rejects) bubble as-is; HTTP errors map to
	// RefreshTokenRejected so callers can distinguish "Spotify said no" from
	// "we couldn't reach Spotify".
	const res = await fetch(TOKEN_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	})
	if (!res.ok) throw new RefreshTokenRejected(res.status, await res.text())
	return res.json()
}

export function storeTokens (tokens: TokenResponse) {
	localStorage.setItem('token', tokens.access_token)
	localStorage.setItem('refresh_token', tokens.refresh_token)
}

export function clearTokens () {
	localStorage.removeItem('token')
	localStorage.removeItem('refresh_token')
}
