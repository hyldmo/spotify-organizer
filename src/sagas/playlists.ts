/* eslint-disable camelcase */
import { all, call, put, select, takeLatest, takeLeading } from 'typed-redux-saga'
import { Action, Actions } from '../actions'
import { Playlist, State, Track } from 'types'
import { deduplicate, partition, pullTracks } from '../utils'
import { sleep } from '../utils/sleep'
import { spotifyFetch } from './spotifyFetch'

export default function* () {
	yield* takeLatest(Actions.fetchPlaylists.type, getPlaylists)
	yield* takeLatest(Actions.fetchTracks.type, getTracks)
	yield* takeLatest(Actions.deduplicatePlaylists.type, deduplicateTracks)
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

		yield* call(getTracks, Actions.fetchTracks({ id: playlist.id, owner: playlist.owner.id }), 3000)
	}
}

function* getPlaylists() {
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

function* getTracks(action: Action<typeof Actions.fetchTracks.type>, delay?: number) {
	const { owner, id } = action.payload
	let tracks: Track[] = []
	let response: SpotifyApi.PlaylistTrackResponse
	const limit = 100
	let offset = 0
	let index = 0
	do {
		response = yield* call(spotifyFetch, `users/${owner}/playlists/${id}/tracks?offset=${offset}&limit=${limit}`)
		if (response === null) break
		const mappedTracks = response.items.map<Track>(t => ({
			id: t.track.id,
			name: t.track.name,
			uri: t.track.uri,
			artists: t.track.artists.map(artist => ({
				id: artist.id,
				name: artist.name,
				uri: artist.uri
			})),
			album: {
				id: t.track.album.id,
				name: t.track.album.name,
				uri: t.track.album.uri
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

function* deduplicateTracks(action: Action<typeof Actions.deduplicatePlaylists.type>) {
	const {
		payload: { source, target },
		meta: compareMode
	} = action
	yield* put(Actions.createNotification({ message: 'Loading tracks', progress: true }))
	yield* all(
		(target ? source.concat(target) : source).map(pl =>
			call(getTracks, Actions.fetchTracks({ id: pl.id, owner: pl.owner.id }) as any)
		)
	)
	const playlists: Playlist[] = yield* select((state: State) =>
		state.playlists.filter(pl => source.map(p => p.id).includes(pl.id))
	)
	let result
	try {
		if (target === null) {
			result = playlists.map(playlist => ({
				...playlist,
				tracks: deduplicate(playlist.tracks.items as Track[], compareMode)
			}))
		} else {
			const targetPlaylist = yield* select((state: State) => state.playlists.find(pl => pl.id === target.id))
			const tracks = playlists.reduce<Track[]>((a, b) => a.concat(b.tracks.items as Track[]), [])
			result = [
				{
					...targetPlaylist,
					tracks: pullTracks(tracks, compareMode, targetPlaylist?.tracks.items || [])
				}
			]
		}
		const totalTracks = result.reduce((a, b) => a + b.tracks.length, 0)
		const confirm = window.confirm(
			`Are you sure? This will remove ${totalTracks} track(s) from ${result.map(p => p.name).join()}`
		)
		if (confirm) {
			yield* put(Actions.createNotification({ id: -1, progress: true, message: 'Removing tracks' }))
			for (const playlist of result) {
				for (const tracks of partition(playlist.tracks, 100)) {
					const body = {
						tracks: tracks.map(track => ({
							uri: `spotify:track:${track.id}`,
							positions: target === null ? [track.meta.index] : undefined
						})),
						snapshot_id: playlist.snapshot_id
					}
					yield* call(spotifyFetch, `users/${playlist.owner?.id}/playlists/${playlist.id}/tracks`, {
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
		yield* put(Actions.createNotification({ message: (err as Error).message }))
	}
}
