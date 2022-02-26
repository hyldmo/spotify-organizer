import { Action } from '~/actions'
import { Track } from '~/types'
import { SongCache } from '~/utils'

interface Song extends SpotifyApi.TrackObjectFull {
	meta: Track['meta']
}

type State = {
	track: Song | null
	artists: SpotifyApi.ArtistObjectFull[] | null
}

const initialState: State = {
	track: null,
	artists: null
}

export default function (state: State = initialState, action: Action): State {
	switch (action.type) {
		case 'FETCH_TRACK_SUCCESS':
			return {
				...state,
				track: {
					...state.track,
					...action.payload
				} as State['track']
			}

		case 'FETCH_TRACK': {
			const track = SongCache.get(action.meta) ?? null
			return {
				...state,
				track: track as any
			}
		}

		case 'FETCH_ARTISTS_SUCCESS':
			return {
				...state,
				artists: action.payload
			}

		default:
			return state
	}
}
