import { all, call, put, select, takeEvery, takeLatest } from 'typed-redux-saga'
import { Action, Actions } from '~/actions'
import { Playlist, State, Track } from '~/types'
import { deduplicate, partition, pullTracks, songEntriesToSongs } from '~/utils'
import { spotifyFetch } from './spotifyFetch'
import { getTracks } from './tracks'

export default function* () {
	yield* takeLatest('FETCH_PLAYLISTS', getPlaylists)
	yield* takeLatest('DEDUPLICATE_PLAYLISTS', deduplicatePlaylists)
	yield* takeEvery('PLAYLIST_DELETE_TRACKS', deleteTracks)
}

function* getPlaylists () {
	let playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse['items'] = []
	let response: SpotifyApi.ListOfCurrentUsersPlaylistsResponse | null
	const limit = 50
	let offset = 0
	do {
		response = yield* call(spotifyFetch, `me/playlists?offset=${offset}&limit=${limit}`)
		if (response === null) break
		playlists = playlists.concat(response.items)
		offset += limit
	} while (response.next !== null)
	yield* put(Actions.playlistsFetched(playlists))
}

function* deleteTracks (action: Action<'PLAYLIST_DELETE_TRACKS'>) {
	const { payload, meta } = action
	const id = typeof meta === 'string' ? meta : meta.id
	const body = {
		tracks: payload.map(uri => ({ uri })),
		snapshot_id: typeof meta !== 'string' ? meta.snapshot_id : undefined
	}
	try {
		yield* call(spotifyFetch, `playlists/${id}/tracks`, {
			method: 'DELETE',
			body: JSON.stringify(body)
		})
		yield* put(Actions.fetchTracks(id))
		yield* put(Actions.createNotification({ message: `${action.payload.length} tracks removed` }))
	} catch (e) {
		yield* put(Actions.createNotification({ message: (e as Error).message, type: 'error' }))
	}
}

function* deduplicatePlaylists (action: Action<'DEDUPLICATE_PLAYLISTS'>) {
	const {
		payload: { source, target },
		meta: compareMode
	} = action
	yield* put(Actions.createNotification({ message: 'Loading tracks', type: 'info', progress: true }))
	yield* all((target ? source.concat(target) : source).map(pl => call(getTracks, Actions.fetchTracks(pl.id))))
	const playlists: Playlist[] = yield* select((state: State) =>
		state.playlists.filter(pl => source.map(p => p.id).includes(pl.id))
	)
	let result
	try {
		if (target === null) {
			result = playlists.map(playlist => ({
				...playlist,
				tracks: deduplicate(songEntriesToSongs(playlist.tracks.items), compareMode)
			}))
		} else {
			const targetPlaylist = yield* select((state: State) => state.playlists.find(pl => pl.id === target.id))
			if (!targetPlaylist) {
				yield* put(Actions.createNotification({ type: 'error', message: 'Target playlist not found' }))
				return
			}
			const tracks = playlists.reduce<Track[]>((a, b) => a.concat(songEntriesToSongs(b.tracks.items)), [])
			result = [
				{
					...targetPlaylist,
					tracks: pullTracks(tracks, compareMode, songEntriesToSongs(targetPlaylist.tracks.items))
				}
			]
		}
		const totalTracks = result.reduce((a, b) => a + b.tracks.length, 0)
		const confirm = window.confirm(
			`Are you sure? This will remove ${totalTracks} track(s) from ${result.map(p => p.name).join()}`
		)
		if (confirm) {
			yield* put(Actions.createNotification({ id: -1, progress: true, type: 'info', message: 'Removing tracks' }))
			for (const playlist of result) {
				for (const tracks of partition(playlist.tracks, 100)) {
					const body = {
						tracks: tracks.map(track => ({
							uri: `spotify:track:${track.id}`,
							positions: target === null ? [track.meta.index] : undefined
						})),
						snapshot_id: playlist.snapshot_id
					}
					yield* call(spotifyFetch, `playlists/${playlist.id}/tracks`, {
						method: 'DELETE',
						body: JSON.stringify(body)
					})
				}
			}
		} else {
			yield* put(Actions.clearNotification(-1))
			return
		}

		yield* put(Actions.createNotification({ message: 'Success!' }))
		yield* put(Actions.fetchPlaylists())
	} catch (err) {
		yield* put(Actions.createNotification({ message: (err as Error).message, type: 'error' }))
	}
}
