import { SkipEntry } from 'types'
import { Action } from '../actions'

export type SkipState = Record<string, SkipEntry | undefined>

const initialState: SkipState = {}

export default function (state = initialState, action: Action): SkipState {
	switch (action.type) {
		case 'PLAYBACK_SONG_SKIPPED': {
			const { payload: song, meta: context } = action
			const entry = state[song.id] || { song, playlists: [], totalSkips: 1 }
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
				[song.id]: {
					...entry,
					totalSkips: entry.playlists.reduce((a, b) => a + b.skips, 0)
				}
			}
		}

		default:
			return state
	}
}
