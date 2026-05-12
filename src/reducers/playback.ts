import { Action } from '~/actions'
import { Playback } from '~/types'

export type PlaybackState = {
	nowPlaying: Playback | null
	/** Whether the currently playing track is saved in the user's library. `null` = not yet known. */
	liked: boolean | null
}

const initialState: PlaybackState = {
	nowPlaying: null,
	liked: null
}

export default function (state = initialState, action: Action): PlaybackState {
	switch (action.type) {
		case 'PLAYBACK_UPDATED': {
			const trackChanged = state.nowPlaying?.item?.id !== action.payload.item?.id
			return {
				...state,
				nowPlaying: action.payload,
				liked: trackChanged ? null : state.liked
			}
		}

		case 'PLAYBACK_LIKED_UPDATED':
			return {
				...state,
				liked: action.payload
			}

		default:
			return state
	}
}
