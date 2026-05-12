import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	finishReauth,
	RefreshTokenRejected,
	reauthenticate,
	reauthInProgress,
	refreshAccessToken
} from '~/utils/spotifyAuth'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

const tokenBody = {
	access_token: 'new-access',
	refresh_token: 'new-refresh',
	expires_in: 3600,
	token_type: 'Bearer',
	scope: ''
}

function jsonResponse(status: number, body: unknown): Response {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body,
		text: async () => JSON.stringify(body)
	} as Response
}

describe('refreshAccessToken', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('returns the token response on success', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, tokenBody))
		vi.stubGlobal('fetch', fetchMock)

		await expect(refreshAccessToken('refresh')).resolves.toEqual(tokenBody)
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(fetchMock.mock.calls[0][0]).toBe(TOKEN_ENDPOINT)
	})

	it('retries transient 5xx responses and succeeds', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				jsonResponse(500, { error: 'server_error', error_description: 'Failed to remove token' })
			)
			.mockResolvedValueOnce(jsonResponse(200, tokenBody))
		vi.stubGlobal('fetch', fetchMock)

		const promise = refreshAccessToken('refresh')
		await vi.runAllTimersAsync()

		await expect(promise).resolves.toEqual(tokenBody)
		expect(fetchMock).toHaveBeenCalledTimes(2)
	})

	it('gives up after repeated 5xx and throws a transient Error (not RefreshTokenRejected)', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				jsonResponse(500, { error: 'server_error', error_description: 'Failed to remove token' })
			)
		vi.stubGlobal('fetch', fetchMock)

		const promise = refreshAccessToken('refresh')
		const caught = promise.catch((e: unknown) => e)
		await vi.runAllTimersAsync()
		const error = await caught

		expect(error).toBeInstanceOf(Error)
		expect(error).not.toBeInstanceOf(RefreshTokenRejected)
		expect((error as Error).message).toContain('500')
		expect(fetchMock.mock.calls.length).toBe(3)
	})

	it('does not retry 4xx and throws RefreshTokenRejected immediately', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(400, { error: 'invalid_grant' }))
		vi.stubGlobal('fetch', fetchMock)

		await expect(refreshAccessToken('refresh')).rejects.toBeInstanceOf(RefreshTokenRejected)
		expect(fetchMock).toHaveBeenCalledOnce()
	})
})

describe('silent re-auth', () => {
	let originalLocation: Location

	beforeEach(() => {
		sessionStorage.clear()
		originalLocation = window.location
		delete (window as { location?: Location }).location
		;(window as { location: unknown }).location = { href: '', pathname: '/skips' }
	})

	afterEach(() => {
		;(window as { location: Location }).location = originalLocation
		sessionStorage.clear()
	})

	it('flags the bounce and redirects through the authorize endpoint', async () => {
		expect(reauthInProgress()).toBe(false)

		await reauthenticate()

		expect(reauthInProgress()).toBe(true)
		expect(window.location.href).toContain('accounts.spotify.com/authorize')
		expect(window.location.href).toContain('response_type=code')
		// the user's current path rides along so they land back where they were
		expect(window.location.href).toContain('state=%2Fskips')
	})

	it('finishReauth clears the in-progress flag', () => {
		sessionStorage.setItem('spotify_reauth_in_progress', '123')
		expect(reauthInProgress()).toBe(true)

		finishReauth()

		expect(reauthInProgress()).toBe(false)
	})
})
