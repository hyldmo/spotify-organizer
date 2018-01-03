import * as _ from 'lodash'
import { Track } from '../types'

export enum CompareType {
	Id,
	Name,
	NameAndAlbum,
	NameAndDuration
}

export function deduplicate (tracks: Track[], compareType = CompareType.Id): Track[] {
	const simpleTracks = tracks.map(track => ({
		id: track.id,
		name: track.name,
		artists: track.artists.map(artist => artist.name).sort(),
		album: track.album.name,
		duration: Math.round(track.duration_ms / 1000)
	}))

	const filteredTracks =  _.uniqWith(simpleTracks, (a, b) => {
		if (a.id === b.id)
			return true
		if (!_.isEqual(a.artists, b.artists))
			return false
		switch (compareType) {
			case CompareType.Name:
				return a.name === b.name
			case CompareType.NameAndAlbum:
				return a.name === b.name && a.album === b.album
			case CompareType.NameAndDuration:
				return a.name === b.name && a.duration === b.duration
			default:
				return false
		}
	})

	return filteredTracks.map(track => tracks.find(t => t.id === track.id) as Track)
}
