import type { Playback, Track, URI } from '~/types'
import { makeActionCreator } from '~/utils/actionCreator'

export type PlaybackCommand = 'play' | 'pause' | 'next' | 'previous' | 'shuffle' | 'repeat'

export default {
	updatePlayback: makeActionCreator<Playback>()('PLAYBACK_UPDATED'),
	songSkipped: makeActionCreator<SpotifyApi.TrackObjectFull, SpotifyApi.ContextObject | null>()(
		'PLAYBACK_SONG_SKIPPED'
	),
	resetSkips: makeActionCreator<Track['id'], URI>()('PLAYBACK_CLEAR_SKIPS'),
	playbackControl: makeActionCreator<PlaybackCommand>()('PLAYBACK_CONTROL'),
	toggleLike: makeActionCreator()('PLAYBACK_TOGGLE_LIKE'),
	updateLiked: makeActionCreator<boolean>()('PLAYBACK_LIKED_UPDATED')
}
