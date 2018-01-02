import * as _ from 'lodash'
import { Track } from '../types'

export function deduplicate (tracks: Track[]): Track[] {
	return _.uniqWith(tracks, (a, b) => {
		return a.id === b.id
	})
}
