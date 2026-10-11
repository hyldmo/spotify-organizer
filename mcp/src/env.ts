import type { OAuthHelpers } from '@cloudflare/workers-oauth-provider'

export interface Env {
	OAUTH_KV: KVNamespace
	SPOTIFY_CLIENT_ID: string
	/** Test override. Defaults to https://accounts.spotify.com */
	SPOTIFY_ACCOUNTS_URL?: string
	/** Test override. Defaults to https://api.spotify.com/v1 */
	SPOTIFY_API_URL?: string
}

/** The provider adds its helpers to `env` before it calls the default handler. */
export type AuthEnv = Env & { OAUTH_PROVIDER: OAuthHelpers }
