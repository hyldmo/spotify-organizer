import { Playback } from 'types'
import { makeActionCreator } from '../utils/actionCreator'

export default {
	updatePlayback: makeActionCreator<Playback>()('PLAYBACK_UPDATED')
}
