import { call, put, select, takeEvery, takeLeading } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { Nullable, Playlist, SongEntries, State, Track, URI } from '~/types'
import { firebaseGet, idToUri, PlaylistCache, SongCache, toTrack } from '~/utils'
import { sleep } from '~/utils/sleep'
import { spotifyFetch } from './spotifyFetch'

export default function* () {
	yield* takeEvery(Actions.fetchTrack.type, getTrack)
	yield* takeEvery(Actions.fetchTracks.type, getTracks)
	yield* takeLeading(Actions.playlistsFetched.type, getAllTracks)
}

function* getAllTracks (action: Action<'FETCH_PLAYLISTS_SUCCESS'>) {
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

		yield* call(getTracks, Actions.fetchTracks(playlist.id), 10000)
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

export function* getTracks (action: Action<'FETCH_TRACKS'>, delay?: number) {
	const id = action.meta
	let tracks: SongEntries = {}
	let response: SpotifyApi.PlaylistTrackResponse | null
	const limit = 100
	let offset = 0
	let index = 0
	let loaded = 0
	const user = yield* select((s: State) => s.user)
	let plays: Nullable<SongEntries>
	try {
		plays = yield* call(() => firebaseGet(`users/${user?.id}/plays/spotify:playlist:${id}/`))
	} catch (e) {
		plays = null
		console.warn('Error fetching plays from firebase', e)
	}

	do {
		try {
			response = yield* call(() =>
				spotifyFetch<SpotifyApi.PlaylistTrackResponse>(`playlists/${id}/tracks?offset=${offset}&limit=${limit}`)
			)
		} catch (e: any) {
			response = null
			yield* put(Actions.createNotification({ message: e.message, type: 'error' }))
		}
		if (response === null) break
		const mappedTracks = response.items.map<Track>(t => toTrack(t, index++))
		mappedTracks.forEach(track => SongCache.set(track.id, track))
		tracks = {
			...tracks,
			...mappedTracks.reduce(
				(a, b) => ({
					...a,
					[b.id]: plays?.[b.id] || 0
				}),
				{}
			)
		}
		offset += limit
		loaded += mappedTracks.length
		yield* call(updateProgress, id, tracks, loaded)
		if (delay) yield* call(sleep, delay)
	} while (response.next !== null)
}

function* updateProgress (id: Playlist['id'], tracks: SongEntries, loaded: number) {
	let playlist: Nullable<Playlist> = yield* select((s: State) => s.playlists.find(p => p.id === id))

	if (!playlist) playlist = PlaylistCache.get(idToUri(id, 'playlist'))
	if (!playlist) playlist = yield* call(() => spotifyFetch<Playlist>(`playlists/${id}`))

	if (playlist) {
		const item: Playlist = {
			...playlist,
			tracks: {
				...playlist.tracks,
				lastFetched: new Date(),
				items: tracks,
				loaded
			}
		}
		PlaylistCache.set(playlist.uri, item)
		if (loaded == item.tracks.total) {
			console.info(`Tracks for '${playlist.name}' (${playlist.id}) loaded`)
			yield* put(Actions.tracksFetched(item, id))
		} else {
			yield* put(Actions.fetchTracksProgress(loaded, id))
		}
	}
}
