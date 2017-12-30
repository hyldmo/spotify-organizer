import { all, call, put, select, takeLatest } from 'redux-saga/effects'
import { Actions } from '../actions'
import { State } from '../reducers/index'
import { Playlist, Track } from '../types'
import { sleep } from '../utils/sleep'
import spotifyApi from './spotifyFetch'

export default function* () {
	yield takeLatest<typeof Actions.fetchPlaylists>(Actions.fetchPlaylists.type, getPlaylists),
	yield takeLatest<typeof Actions.fetchTracks>(Actions.fetchTracks.type, getTracks)
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
	do {
		response = yield call(spotifyApi, `users/${owner}/playlists/${id}/tracks?offset=${offset}&limit=${limit}`)
		const albums: Array<Track['album']> = yield all(response.items
			.filter(p => !p.is_local)
			.map(p => getAlbum(p.track.album.id)))
		const mappedTracks = response.items.map<Track>(t => ({
			...t.track,
			album: albums.find(a => a.id === t.track.album.id) || t.track.album,
			meta: {
				added_at: t.added_at,
				added_by: t.added_by,
				is_local: t.is_local
			}
		}))
		tracks = tracks.concat(mappedTracks)
		offset += limit
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

const albumCache = new Map<string, SpotifyApi.AlbumObjectFull>()

function* getAlbum (albumId: string) {
	if (albumCache.has(albumId))
		return albumCache.get(albumId) as SpotifyApi.AlbumObjectFull

	const album: SpotifyApi.AlbumObjectFull = yield spotifyApi(`albums/${albumId}`)
	albumCache.set(albumId, album)
	return album
}
