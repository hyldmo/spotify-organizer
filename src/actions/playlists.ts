/* eslint-disable @typescript-eslint/member-delimiter-style */
import { Playlist, Sort, Track } from '../types'
import { CompareType } from '../utils'
import { makeActionCreator } from '../utils/actionCreator'

export default {
	fetchPlaylists: makeActionCreator()('FETCH_PLAYLISTS'),
	playlistsFetched: makeActionCreator<SpotifyApi.PlaylistObjectSimplified[]>()('FETCH_PLAYLISTS_SUCCESS'),
	fetchTracks: makeMetaActionCreator<Playlist['id']>()('FETCH_TRACKS'),
	fetchTracksProgress: makeActionCreator<number, Playlist['id']>()('FETCH_TRACKS_PROGRESS'),
	tracksFetched: makeActionCreator<Track[], Playlist['id']>()('FETCH_TRACKS_SUCCESS'),

	selectPlaylist: makeActionCreator<boolean, Playlist['id']>()('PLAYLISTS_SELECT'),
	selectPlaylists: makeActionCreator<boolean>()('PLAYLISTS_SELECT_ALL'),
	updatePlaylistsSort: makeActionCreator<Sort, keyof Playlist | string>()('PLAYLISTS_SORT_MODE_CHANGE'),
	updateHideEmptyFilter: makeActionCreator<boolean>()('PLAYLISTS_FILTER_EMPTY_CHANGE'),
	updateOwnedFilter: makeActionCreator<boolean>()('PLAYLISTS_FILTER_OWNED_CHANGE'),
	updateFilterText: makeActionCreator<string>()('PLAYLISTS_FILTER_TEXT_CHANGE'),
	deduplicatePlaylists: makeActionCreator<{ source: Playlist[]; target: Playlist | null }, CompareType>()(
		'DEDUPLICATE_PLAYLISTS'
	)
}
