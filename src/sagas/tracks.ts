import { all, call, put, select, takeEvery, takeLeading } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { Nullable, Playlist, SongEntries, State, Track, URI } from '~/types'
import { firebaseGet, idToUri, PlaylistCache, SongCache, toTrack } from '~/utils'
import { spotifyFetch } from './spotifyFetch'

// Dedupes concurrent `getTracks` invocations for the same playlist id. Several
// call sites can race here — `usePlaylist` on the route, `getAllTracks` on the
// playlists-fetched fan-out, `deleteTracks` after a mutation — and `takeEvery`
// gives no in-flight protection on its own.
const inFlight = new Set<Playlist['id']>()

export function* tracksSaga () {
	yield* takeEvery(Actions.fetchTrack.type, getTrack)
	yield* takeEvery(Actions.fetchTracks.type, getTracks)
	yield* takeLeading(Actions.playlistsFetched.type, getAllTracks)
}

function* getAllTracks (action: Action<'FETCH_PLAYLISTS_SUCCESS'>) {
	// PlaylistCache hydration is async — without this wait, the very first
	// session after a reload reads an empty Map and refetches every playlist
	// from Spotify, even when fully cached locally.
	yield* call(() => PlaylistCache.ready)

	for (const playlist of action.payload) {
		const existing = PlaylistCache.get(playlist.uri as URI<'playlist'>)
		if (existing) {
			if (existing.snapshot_id === playlist.snapshot_id) {
				if (existing.tracks.lastFetched) continue
				console.info(`Playlist '${playlist.name}' has not been cached, loading tracks`)
			} else {
				console.info(`Playlist '${playlist.name}' has been updated, fetching new tracks`)
			}
		}

		yield* call(getTracks, Actions.fetchTracks(playlist.id))
	}
	console.info('All playlist tracks up to date')
}

export function* getTrack (action: Action<'FETCH_TRACK'>) {
	const id = action.meta
	const track = yield* call(() => spotifyFetch<SpotifyApi.SingleTrackResponse>(`tracks/${id}`))
	if (track) {
		yield* put(Actions.fetchTrackSuccess(track, id))
		const artists = yield* call(() =>
			spotifyFetch<SpotifyApi.MultipleArtistsResponse>(`artists/?ids=${track.artists.map(a => a.id)}`)
		)
		if (artists) {
			yield put(Actions.fetchArtistsSuccess(artists.artists, id))
			return
		}
	}
	yield put(Actions.createNotification({ message: 'Error fetching track', type: 'error' }))
}

function* fetchPlays (uid: string | null | undefined, id: Playlist['id']): Generator<unknown, Nullable<SongEntries>> {
	if (!uid) return null
	try {
		return yield* call(() => firebaseGet(`users/${uid}/plays/spotify:playlist:${id}/`))
	} catch (e) {
		console.warn(`Error fetching plays from firebase 'users/${uid}/plays/spotify:playlist:${id}/'`, e)
		return null
	}
}

export function* getTracks (action: Action<'FETCH_TRACKS'>) {
	const id = action.meta
	if (inFlight.has(id)) return
	inFlight.add(id)
	try {
		const limit = 100
		const user = yield* select((s: State) => s.user)

		const fetchPage = (offset: number) =>
			spotifyFetch<SpotifyApi.PlaylistTrackResponse>(`playlists/${id}/tracks?offset=${offset}&limit=${limit}`)

		// Page 0 and the plays lookup are independent — running them in parallel
		// saves up to ~16s on cold starts where Firebase anon-auth is retrying.
		let first: SpotifyApi.PlaylistTrackResponse | null
		let plays: Nullable<SongEntries>
		try {
			const result = yield* all({
				first: call(fetchPage, 0),
				plays: call(fetchPlays, user?.uid, id)
			})
			first = result.first
			plays = result.plays
		} catch (e: any) {
			yield* put(Actions.createNotification({ message: e.message, type: 'error' }))
			return
		}
		if (first === null) return
		const total = first.total

		const tracks: SongEntries = {}
		let loaded = 0

		function* processPage (page: SpotifyApi.PlaylistTrackResponse, offset: number) {
			const mapped = page.items
				.filter(t => t.track)
				.map<Track>((t, i) => toTrack(t, offset + i))
			mapped.forEach(track => SongCache.set(track.id, track))
			for (const t of mapped) tracks[t.id] = plays?.[t.id] || 0
			loaded += mapped.length
			yield* call(updateProgress, id, tracks, loaded, loaded === total)
		}

		yield* call(processPage, first, 0)

		const remainingOffsets: number[] = []
		for (let o = limit; o < total; o += limit) remainingOffsets.push(o)

		if (remainingOffsets.length === 0) return

		function* fetchAndProcess (offset: number) {
			const page = yield* call(fetchPage, offset)
			if (page) yield* call(processPage, page, offset)
		}

		try {
			yield* all(remainingOffsets.map(o => call(fetchAndProcess, o)))
		} catch (e: any) {
			yield* put(Actions.createNotification({ message: e.message, type: 'error' }))
		}
	} finally {
		inFlight.delete(id)
	}
}

function* updateProgress (id: Playlist['id'], tracks: SongEntries, loaded: number, complete: boolean) {
	let playlist: Nullable<Playlist> = yield* select((s: State) => s.playlists.find(p => p.id === id))

	if (!playlist) playlist = PlaylistCache.get(idToUri(id, 'playlist'))
	if (!playlist) playlist = yield* call(() => spotifyFetch<Playlist>(`playlists/${id}`))

	if (!playlist) return

	const item: Playlist = {
		...playlist,
		tracks: {
			...playlist.tracks,
			// Only stamp lastFetched on the final write — partial writes must not
			// look "complete" to consumers like `usePlaylist`'s watch effect.
			lastFetched: complete ? new Date() : playlist.tracks.lastFetched ?? null,
			items: tracks,
			loaded
		}
	}
	PlaylistCache.set(playlist.uri, item)
	if (complete) {
		console.info(`Tracks for '${playlist.name}' (${playlist.id}) loaded`)
		yield* put(Actions.tracksFetched(item, id))
	} else {
		yield* put(Actions.fetchTracksProgress(loaded, id))
	}
}
