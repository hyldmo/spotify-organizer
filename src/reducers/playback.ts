import { Playback, SkipEntry } from 'types'
import { Action } from '../actions'
import { ImmutableCache } from 'utils'

export type PlaybackState = {
	nowPlaying: Playback | null
	skips: ImmutableCache<SkipEntry>
}

const initialState: PlaybackState = {
	nowPlaying: null,
	skips: new ImmutableCache<SkipEntry>('songskips')
}

export default function (state = initialState, action: Action): PlaybackState {
	switch (action.type) {
		case 'PLAYBACK_SONG_SKIPPED': {
			const { payload: song, meta: context } = action
			const songCache = state.skips
			const entry = songCache.get(song.id) || { song, playlists: [], totalSkips: 1 }
			const uri = context?.uri || 'unknown'
			const playlistEntry = entry.playlists.find(pl => pl.uri === uri)
			if (playlistEntry) {
				playlistEntry.skips++
			} else {
				entry.playlists.push({
					uri,
					name: null,
					skips: 1
				})
			}

			return {
				...state,
				skips: songCache.set(song.id, {
					...entry,
					totalSkips: entry.playlists.reduce((a, b) => a + b.skips, 0)
				})
			}
		}

		case 'PLAYBACK_UPDATED':
			return {
				...state,
				nowPlaying: action.payload
			}

		default:
			return state
	}
}
