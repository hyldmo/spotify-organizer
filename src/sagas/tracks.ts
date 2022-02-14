import { call, put, select, takeLatest, takeLeading } from 'typed-redux-saga'
import { Action, Actions } from '../actions'
import { Playlist, State, Track } from 'types'
import { toTrack } from '../utils'
import { sleep } from '../utils/sleep'
import { spotifyFetch } from './spotifyFetch'
import { __DEV__ } from '../constants'

export default function* () {
	yield* takeLatest(Actions.fetchTracks.type, getTracks)
	yield* takeLeading(Actions.playlistsFetched.type, getAllTracks)
}

function* getAllTracks(action: Action<'FETCH_PLAYLISTS_SUCCESS'>) {
	if (__DEV__) return // Don't cache tracks in dev mode
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

		yield* call(getTracks, Actions.fetchTracks(playlist.id), 3000)
	}
	console.info('All playlist tracks up to date')
}

export function* getTracks(action: Action<typeof Actions.fetchTracks.type>, delay?: number) {
	const id = action.meta
	let tracks: Track[] = []
	let response: SpotifyApi.PlaylistTrackResponse
	const limit = 100
	let offset = 0
	let index = 0
	do {
		response = yield* call(spotifyFetch, `playlists/${id}/tracks?offset=${offset}&limit=${limit}`)
		if (response === null) break
		const mappedTracks = response.items.map<Track>(t => toTrack(t, index++))
		tracks = tracks.concat(mappedTracks)
		offset += limit
		yield* put(Actions.fetchTracksProgress(tracks.length, id))
		if (delay) yield* call(sleep, delay)
	} while (response.next !== null)

	function* waitForPlaylists(): IterableIterator<any> {
		const playlist: Playlist | undefined = yield* select((s: State) => s.playlists.find(p => p.id === id))
		if (playlist) return
		yield* call(sleep, 50)
		yield* call(waitForPlaylists)
	}

	yield* call(waitForPlaylists)
	yield* put(Actions.tracksFetched(tracks, id))
}
