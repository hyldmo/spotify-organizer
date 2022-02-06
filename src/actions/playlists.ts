/* eslint-disable @typescript-eslint/member-delimiter-style */
import { Playlist, Sort, Track } from '../types'
import { CompareType } from '../utils'
import { createAction } from './actionCreator'

export default {
	fetchPlaylists: createAction<'FETCH_PLAYLISTS'>('FETCH_PLAYLISTS'),
	playlistsFetched: createAction<'FETCH_PLAYLISTS_SUCCESS', SpotifyApi.PlaylistObjectSimplified[]>(
		'FETCH_PLAYLISTS_SUCCESS'
	),
	fetchTracks: createAction<'FETCH_TRACKS', { owner: string; id: string }>('FETCH_TRACKS'),
	fetchTracksProgress: createAction<'FETCH_TRACKS_PROGRESS', number, string>('FETCH_TRACKS_PROGRESS'),
	tracksFetched: createAction<'FETCH_TRACKS_SUCCESS', Track[], string>('FETCH_TRACKS_SUCCESS'),

	selectPlaylist: createAction<'PLAYLISTS_SELECT', boolean, string>('PLAYLISTS_SELECT'),
	selectPlaylists: createAction<'PLAYLISTS_SELECT_ALL', boolean>('PLAYLISTS_SELECT_ALL'),
	updatePlaylistsSort: createAction<'PLAYLISTS_SORT_MODE_CHANGE', Sort, keyof Playlist | string>(
		'PLAYLISTS_SORT_MODE_CHANGE'
	),
	updateHideEmptyFilter: createAction<'PLAYLISTS_FILTER_EMPTY_CHANGE', boolean>('PLAYLISTS_FILTER_EMPTY_CHANGE'),
	updateOwnedFilter: createAction<'PLAYLISTS_FILTER_OWNED_CHANGE', boolean>('PLAYLISTS_FILTER_OWNED_CHANGE'),
	updateFilterText: createAction<'PLAYLISTS_FILTER_TEXT_CHANGE', string>('PLAYLISTS_FILTER_TEXT_CHANGE'),
	deduplicatePlaylists: createAction<
		'DEDUPLICATE_PLAYLISTS',
		{ source: Playlist[]; target: Playlist | null },
		CompareType
	>('DEDUPLICATE_PLAYLISTS')
}
