import { Action } from '~/actions'
import { Playback } from '~/types'

export type PlaybackState = {
	nowPlaying: Playback | null
}

const initialState: PlaybackState = {
	nowPlaying: null
}

export default function (state = initialState, action: Action): PlaybackState {
	switch (action.type) {
		case 'PLAYBACK_UPDATED':
			return {
				...state,
				nowPlaying: action.payload
			}

		default:
			return state
	}
}
