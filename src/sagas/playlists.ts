import { all, call, put, select, takeLatest } from 'redux-saga/effects'
import { Actions } from '../actions'
import { State } from '../reducers/index'
import { Playlist, RemoveTracksRequest, Track } from '../types'
import { deduplicate, partition, pullTracks } from '../utils'
import { sleep } from '../utils/sleep'
import spotifyApi from './spotifyFetch'

export default function* () {
	yield takeLatest<typeof Actions.fetchPlaylists>(Actions.fetchPlaylists.type, getPlaylists),
	yield takeLatest<typeof Actions.fetchTracks>(Actions.fetchTracks.type, getTracks)
	yield takeLatest<typeof Actions.deduplicatePlaylists>(Actions.deduplicatePlaylists.type, deduplicateTracks)
}

function* getPlaylists () {
	let playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse['items'] = []
	let response: SpotifyApi.ListOfCurrentUsersPlaylistsResponse
	const limit = 50
	let offset = 0
	do {
		response = yield call(spotifyApi, `me/playlists?offset=${offset}&limit=${limit}`)
		playlists = playlists.concat(response.items)
		offset += limit
	} while (response.next !== null)
	yield put(Actions.playlistsFetched(playlists))
}

function* getTracks (action: typeof Actions.fetchTracks) {
	const { owner, id } = action.payload
	let tracks: Track[] = []
	let response: SpotifyApi.PlaylistTrackResponse
	const limit = 100
	let offset = 0
	let index = 0
	do {
		response = yield call(spotifyApi, `users/${owner}/playlists/${id}/tracks?offset=${offset}&limit=${limit}`)
		const mappedTracks = response.items.map<Track>(t => ({
			id: t.track.id,
			name: t.track.name,
			artists: t.track.artists.map(artist => ({
				id: artist.id,
				name: artist.name
			})),
			album: {
				id: t.track.album.id,
				name: t.track.album.name
			},
			duration_ms: t.track.duration_ms,
			meta: {
				added_at: t.added_at,
				added_by: t.added_by,
				is_local: t.is_local,
				index: index++
			}
		}))
		tracks = tracks.concat(mappedTracks)
		offset += limit
		yield put(Actions.fetchTracksProgress(tracks.length, id))
	} while (response.next !== null)

	function* waitForPlaylists (): IterableIterator<any> {
		const playlist: Playlist = yield select<State>(s => s.playlists.find(p => p.id === id))
		if (playlist)
			return
		yield call(sleep, 50)
		yield call(waitForPlaylists)
	}

	yield call(waitForPlaylists)
	yield put(Actions.tracksFetched(tracks, id))
}

function* deduplicateTracks (action: typeof Actions.deduplicatePlaylists) {
	const { payload: { source, target }, meta: compareMode } = action
	yield put(Actions.createNotification({ message: 'Loading tracks', progress: true }))
	yield all((target ? source.concat(target) : source).map(pl => call(getTracks, Actions.fetchTracks({ id: pl.id, owner: pl.owner.id }))))
	const playlists: Playlist[] = yield select((state: State) => state.playlists.filter(pl => source.map(p => p.id).includes(pl.id)))
	let result
	try {
		if (target === null) {
			result = playlists.map(playlist => ({ ...playlist, tracks: deduplicate(playlist.tracks.items as Track[], compareMode) }))
		} else {
			const targetPlaylist: Playlist = yield select((state: State) => state.playlists.find(pl => pl.id === target.id))
			const tracks = playlists.reduce<Track[]>((a, b) => a.concat(b.tracks.items as Track[]), [])
			result = [{
				...targetPlaylist,
				tracks: pullTracks(tracks, compareMode, targetPlaylist.tracks.items as Track[])
			}]
		}
		const totalTracks = result.reduce((a, b) => a + b.tracks.length, 0)
		const confirm = window.confirm(`Are you sure? This will remove ${totalTracks} track(s) from ${result.map(p => p.name).join()}`)
		if (confirm) {
			yield put(Actions.createNotification({ message: 'Removing tracks', progress: true }))
			for (const playlist of result) {
				for (const tracks of partition(playlist.tracks, 100)) {
					const body: RemoveTracksRequest = {
						tracks: tracks.map(track => ({
							uri: `spotify:track:${track.id}`,
							positions: target === null ? [track.meta.index] : undefined
						})),
						snapshot_id: playlist.snapshot_id
					}
					yield call(spotifyApi, `users/${playlist.owner.id}/playlists/${playlist.id}/tracks`, {
						method: 'DELETE',
						body: JSON.stringify(body)
					})
				}
			}
		} else {
			yield put(Actions.clearNotification())
			return
		}

		yield put(Actions.createNotification({ message: 'Success!' }))
		yield put(Actions.fetchPlaylists())
	} catch (err) {
		yield put(Actions.createNotification({ message: err.message }))
	}
}
