import { all, call, put, select, takeEvery, takeLatest } from 'typed-redux-saga'
import { type Action, Actions } from '~/actions'
import type { Playlist, State, Track } from '~/types'
import { deduplicate, PlaylistCache, partition, pullTracks, songEntriesToSongs } from '~/utils'
import { spotifyFetch } from './spotifyFetch'
import { getTracks } from './tracks'

export function* playlistsSaga() {
	yield* takeLatest('FETCH_PLAYLISTS', getPlaylists)
	yield* takeLatest('DEDUPLICATE_PLAYLISTS', deduplicatePlaylists)
	yield* takeEvery('PLAYLIST_DELETE_TRACKS', deleteTracks)
}

function* getPlaylists() {
	console.info('getPlaylists: fetching playlist list')
	const playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse['items'] = []
	let response: SpotifyApi.ListOfCurrentUsersPlaylistsResponse | null
	const limit = 50
	let offset = 0
	do {
		response = yield* call(() =>
			spotifyFetch<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(`me/playlists?offset=${offset}&limit=${limit}`)
		)
		if (response === null) break
		for (const item of response.items) {
			if (playlists.find(p => p.id === item.id)) continue
			playlists.push(item)
		}
		offset += limit
	} while (response.next !== null)
	// The FETCH_PLAYLISTS_SUCCESS reducer reads PlaylistCache synchronously to
	// seed each playlist's items + lastFetched. If the API races ahead of cache
	// hydration the reducer sees an empty Map and leaves redux with no items —
	// the "In playlists" column then renders 0 for every track because the
	// `tracks.lastFetched` filter excludes every other playlist.
	yield* call(() => PlaylistCache.ready)
	console.info(`getPlaylists: ${playlists.length} playlists fetched, cache ready`)
	yield* put(Actions.playlistsFetched(playlists))
}

function* deleteTracks(action: Action<'PLAYLIST_DELETE_TRACKS'>) {
	const { payload, meta } = action
	const id = typeof meta === 'string' ? meta : meta.id
	const snapshot_id = typeof meta !== 'string' ? meta.snapshot_id : undefined
	try {
		// Spotify caps `playlists/{id}/tracks` DELETE at 100 URIs per request.
		for (const chunk of partition([...payload], 100)) {
			yield* call(spotifyFetch, `playlists/${id}/tracks`, {
				method: 'DELETE',
				body: JSON.stringify({
					tracks: chunk.map(uri => ({ uri })),
					snapshot_id
				})
			})
		}
		yield* put(Actions.fetchTracks(id))
		yield* put(Actions.createNotification({ message: `${payload.length} tracks removed` }))
	} catch (e) {
		yield* put(Actions.createNotification({ message: (e as Error).message, type: 'error' }))
	}
}

function* deduplicatePlaylists(action: Action<'DEDUPLICATE_PLAYLISTS'>) {
	const {
		payload: { source, target },
		meta: compareMode
	} = action
	yield* put(Actions.createNotification({ message: 'Loading tracks', type: 'info', progress: true }))
	yield* all((target ? source.concat(target) : source).map(pl => call(getTracks, Actions.fetchTracks(pl.id))))
	const playlists: Playlist[] = yield* select((state: State) =>
		state.playlists.filter(pl => source.map(p => p.id).includes(pl.id))
	)
	// biome-ignore lint/suspicious/noImplicitAnyLet: assigned in both branches of the if/else below
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
