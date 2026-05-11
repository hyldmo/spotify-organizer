import { runSaga, stdChannel } from 'redux-saga'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/sagas/spotifyFetch', () => ({
	spotifyFetch: vi.fn()
}))

vi.mock('~/utils/firebase', () => ({
	firebaseGet: vi.fn().mockResolvedValue(null),
	firebaseUpdate: vi.fn().mockResolvedValue(undefined),
	firebaseWatch: vi.fn(() => () => undefined),
	ensureFirebaseReady: vi.fn().mockResolvedValue(null),
	resetFirebaseAuth: vi.fn(),
	getFirebaseUid: vi.fn(() => null),
	setSpotifyId: vi.fn(),
	migrateLegacyUidData: vi.fn(),
	auth: {}
}))

// PlaylistCache/SongCache normally back onto localforage → IndexedDB, which
// jsdom can run but slowly. Stub them with plain Maps + a resolved ready
// promise so the saga's `PlaylistCache.ready` await returns immediately.
vi.mock('~/utils/Cache', () => {
	class FakeCache<T> extends Map<string, T> {
		public readonly ready = Promise.resolve()
		public id: string
		constructor (id: string) {
			super()
			this.id = id
		}
	}
	return { PersistentCache: FakeCache }
})

import { Actions } from '~/actions'
import { spotifyFetch } from '~/sagas/spotifyFetch'
import { getTracks } from '~/sagas/tracks'

const trackPage = (offset: number, total: number, count: number) => ({
	items: Array.from({ length: count }, (_, i) => ({
		track: {
			id: `track-${offset + i}`,
			name: `Track ${offset + i}`,
			uri: `spotify:track:track-${offset + i}`,
			artists: [{ id: 'a1', name: 'Artist', uri: 'spotify:artist:a1' }],
			album: { id: 'al1', name: 'Album', uri: 'spotify:album:al1', images: [] },
			duration_ms: 1000
		},
		added_at: '2026-01-01',
		added_by: { id: 'u1' },
		is_local: false
	})),
	total,
	href: '',
	limit: 100,
	offset,
	next: null,
	previous: null
})

const baseIo = (overrides: Record<string, unknown> = {}) => ({
	channel: stdChannel(),
	dispatch: vi.fn(),
	getState: () => ({
		user: { uid: null, spotifyToken: 'tok' },
		playlists: [{ id: 'p1', uri: 'spotify:playlist:p1', name: 'P1', snapshot_id: 's1', tracks: { total: 250 } }],
		...overrides
	})
})

describe('getTracks', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('dedupes concurrent invocations for the same playlist id', async () => {
		// Slow the playlist track endpoint so the second invocation races against
		// the first. `playlists/<id>` (used by updateProgress when state lacks the
		// playlist) is fast and unrelated.
		;(spotifyFetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => {
			if (url.includes('/tracks?')) {
				await new Promise(r => setTimeout(r, 25))
				const m = url.match(/offset=(\d+)/)
				const off = m ? parseInt(m[1], 10) : 0
				return trackPage(off, 250, 100)
			}
			return null
		})

		const io = baseIo()
		const tasks = Array.from({ length: 5 }, () => runSaga(io, getTracks, Actions.fetchTracks('p1')))
		await Promise.all(tasks.map(t => t.toPromise()))

		// Page count: ceil(250/100) = 3 pages. Five concurrent dispatches must not
		// multiply the network: only the first invocation should fetch.
		const trackFetches = (spotifyFetch as ReturnType<typeof vi.fn>).mock.calls.filter(c =>
			String(c[0]).includes('/tracks?')
		)
		expect(trackFetches).toHaveLength(3)
	})

	it('fans out remaining pages in parallel after page 0', async () => {
		const callTimes: number[] = []
		;(spotifyFetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => {
			if (url.includes('/tracks?')) {
				callTimes.push(Date.now())
				await new Promise(r => setTimeout(r, 20))
				const m = url.match(/offset=(\d+)/)
				const off = m ? parseInt(m[1], 10) : 0
				return trackPage(off, 500, 100)
			}
			return null
		})

		await runSaga(baseIo(), getTracks, Actions.fetchTracks('p2')).toPromise()

		// 5 pages total: page 0 first, pages 100..400 should fire ~simultaneously.
		expect(callTimes).toHaveLength(5)
		const afterFirst = callTimes.slice(1)
		const spread = Math.max(...afterFirst) - Math.min(...afterFirst)
		expect(spread).toBeLessThan(15)
	})
})
