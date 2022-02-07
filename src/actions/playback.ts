import { Playback } from 'types'
import { makeActionCreator } from '../utils/actionCreator'

export default {
	updatePlayback: makeActionCreator<Playback>()('PLAYBACK_UPDATED'),
	songSkipped: makeActionCreator<SpotifyApi.TrackObjectFull, SpotifyApi.ContextObject | null>()(
		'PLAYBACK_SONG_SKIPPED'
	)
}
