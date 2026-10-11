import {
	AuthorizationError,
	authorizationErrorRedirect,
	CimdFetchError,
	GrantType,
	type OAuthHelpers,
	type TokenExchangeCallbackOptions,
	type TokenExchangeCallbackResult
} from '@cloudflare/workers-oauth-provider'
import type { AuthEnv, Env } from '../env'
import { consentPage, errorPage, html } from './pages'
import {
	authorizeUrl,
	createVerifier,
	refreshAccess,
	SignInError,
	type SpotifyAccess,
	type SpotifyGrant,
	type SpotifySession,
	signIn
} from './spotify'

// Spotify skips its own consent screen for users who already approved Spotify Organiser, so our consent page is
// the only step that names the MCP client. Never send a browser to Spotify without it (the confused deputy problem
// in MCP's security guidance). The provider's helpers bind each step to the browser that started it.

export function oauthHelpers(env: Env): OAuthHelpers {
	return (env as AuthEnv).OAUTH_PROVIDER
}

/** The page for an expected OAuth failure, or undefined for anything else. */
export function authErrorResponse(error: unknown) {
	if (error instanceof AuthorizationError) {
		// Only parseAuthRequest() sets redirectTo, once the client and its redirect URI check out.
		return error.redirectTo ? Response.redirect(error.redirectTo, 302) : html(errorPage(error.description), 400)
	}
	if (error instanceof CimdFetchError) return html(errorPage('This app could not be verified.'), 400)
}

export async function askConsent(request: Request, oauth: OAuthHelpers) {
	const authRequest = await oauth.parseAuthRequest(request)
	const details = await oauth.describeConsent(authRequest)
	const { handle, headers } = await oauth.beginConsent(authRequest)
	return html(consentPage(details, handle), 200, headers)
}

export async function decide(request: Request, env: Env, oauth: OAuthHelpers) {
	const form = await request.formData()
	const handle = String(form.get('handle') ?? '')
	if (form.get('decision') !== 'allow') {
		const { headers } = await oauth.denyConsent(request, handle)
		return new Response(null, { status: 302, headers })
	}

	const approved = await oauth.approveConsent(request, handle)
	const verifier = createVerifier()
	const { state, headers } = await oauth.beginUpstream(approved.request, {
		data: { verifier },
		headers: approved.headers
	})
	headers.set('Location', await authorizeUrl(env, { redirectUri: callbackUrl(request), state, verifier }))
	return new Response(null, { status: 302, headers })
}

export async function finishSignIn(request: Request, env: Env, oauth: OAuthHelpers) {
	const { request: authRequest, data, headers } = await oauth.finishUpstream<{ verifier: string }>(request)
	const code = new URL(request.url).searchParams.get('code')
	if (!code) {
		headers.set('Location', authorizationErrorRedirect(authRequest, 'access_denied'))
		return new Response(null, { status: 302, headers })
	}

	let session: SpotifySession
	try {
		session = await signIn(env, { code, verifier: data.verifier, redirectUri: callbackUrl(request) })
	} catch (error) {
		if (error instanceof SignInError) return html(errorPage(error.message), 502, headers)
		throw error
	}
	const { redirectTo } = await oauth.completeAuthorization({
		request: authRequest,
		// Grant user IDs can't contain ':'.
		userId: encodeURIComponent(session.userId),
		metadata: {},
		scope: authRequest.scope,
		props: session
	})
	headers.set('Location', redirectTo)
	return new Response(null, { status: 302, headers })
}

function callbackUrl(request: Request) {
	return `${new URL(request.url).origin}/callback`
}

/** Expire our access token two minutes before Spotify's, so clients refresh before Spotify starts refusing it. */
function ttlUntil(expiresAt: number) {
	return Math.max(60, Math.floor((expiresAt - Date.now()) / 1000) - 120)
}

/**
 * The Spotify access token rides on the MCP access token and the refresh token stays on the grant, so every MCP
 * refresh is also a Spotify refresh.
 */
export async function exchangeTokens({
	grantType,
	props,
	env
}: TokenExchangeCallbackOptions<Env>): Promise<TokenExchangeCallbackResult | undefined> {
	if (grantType === GrantType.AUTHORIZATION_CODE) {
		const { userId, accessToken, refreshToken, expiresAt } = props as SpotifySession
		return {
			accessTokenProps: { userId, accessToken } satisfies SpotifyAccess,
			newProps: { userId, refreshToken } satisfies SpotifyGrant,
			accessTokenTTL: ttlUntil(expiresAt)
		}
	}
	if (grantType === GrantType.REFRESH_TOKEN) {
		const grant = props as SpotifyGrant
		const tokens = await refreshAccess(env, grant)
		return {
			accessTokenProps: { userId: grant.userId, accessToken: tokens.access_token } satisfies SpotifyAccess,
			// Spotify rotates refresh tokens for PKCE clients.
			newProps: {
				userId: grant.userId,
				refreshToken: tokens.refresh_token ?? grant.refreshToken
			} satisfies SpotifyGrant,
			accessTokenTTL: ttlUntil(Date.now() + tokens.expires_in * 1000)
		}
	}
}
