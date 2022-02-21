import { call, put, select, takeLatest, takeLeading } from 'typed-redux-saga'
import { FirebaseGet, Playlist, SongEntries, State, Track } from 'types'
import { Action, Actions } from '../actions'
import { firebaseGet, SongCache, toTrack } from '../utils'
import { sleep } from '../utils/sleep'
import { spotifyFetch } from './spotifyFetch'

export default function* () {
	yield* takeLatest(Actions.fetchTrack.type, getTrack)
	yield* takeLatest(Actions.fetchTracks.type, getTracks)
	yield* takeLeading(Actions.playlistsFetched.type, getAllTracks)
}

function* getAllTracks(action: Action<'FETCH_PLAYLISTS_SUCCESS'>) {
	for (const playlist of action.payload) {
		const existing = yield* select((s: State) => s.playlists.find(pl => pl.id === playlist.id))
		if (existing) {
			if (existing.snapshot_id === playlist.snapshot_id) {
				if (existing.tracks.lastFetched) continue
				console.info(`Playlist '${playlist.name}' has not been cached, loading tracks`)
			} else {
				console.info(`Playlist '${playlist.name}' has been updated, fetching new tracks`)
			}
		}

		yield* call(getTracks, Actions.fetchTracks(playlist.id), 10000)
	}
	console.info('All playlist tracks up to date')
}

export function* getTrack(action: Action<'FETCH_TRACK'>) {
	const id = action.meta
	const track: SpotifyApi.SingleTrackResponse = yield* call(spotifyFetch, `tracks/${id}`)
	yield* put(Actions.fetchTrackSuccess(track, id))

	const artists: SpotifyApi.MultipleArtistsResponse = yield* call(
		spotifyFetch,
		`artists/?ids=${track.artists.map(a => a.id)}`
	)
	yield put(Actions.fetchArtistsSuccess(artists.artists, id))
}

export function* getTracks(action: Action<'FETCH_TRACKS'>, delay?: number) {
	const id = action.meta
	let tracks: SongEntries = {}
	let response: SpotifyApi.PlaylistTrackResponse
	const limit = 100
	let offset = 0
	let index = 0
	const user = yield* select((s: State) => s.user)
	const plays: FirebaseGet<`users/${string}/plays/spotify:playlist:${string}/`> | null = yield* call(
		firebaseGet,
		`users/${user?.id}/plays/spotify:playlist:${id}/`
	) as any
	do {
		response = yield* call(spotifyFetch, `playlists/${id}/tracks?offset=${offset}&limit=${limit}`)
		if (response === null) break
		const mappedTracks = response.items.map<Track>(t => toTrack(t, index++))
		mappedTracks.forEach(track => SongCache.set(track.id, track))
		tracks = Object.assign(
			tracks,
			mappedTracks.reduce((a, b) => Object.assign(a, { [b.id]: plays?.[b.id] || 0 }), {})
		)
		offset += limit
		yield* put(Actions.fetchTracksProgress(Object.keys(tracks).length, id))
		if (delay) yield* call(sleep, delay)
	} while (response.next !== null)

	function* waitForPlaylists(): IterableIterator<any> {
		const playlist: Playlist | undefined = yield* select((s: State) => s.playlists.find(p => p.id === id))
		if (playlist) return
		yield* call(sleep, 100)
		yield* call(waitForPlaylists)
	}

	yield* call(waitForPlaylists)
	yield* put(Actions.tracksFetched(tracks, id))
}
