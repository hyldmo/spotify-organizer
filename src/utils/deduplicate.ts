import { differenceWith, isEqual, uniqWith } from 'lodash'
import * as memoize from 'memoizee'
import { Track } from '../types'

export enum CompareType {
	SongId,
	Name,
	NameAndAlbum,
	NameAndDuration
}

const simplifyTrack = memoize((track: Track) => ({
	id: track.id,
	name: track.name,
	artists: track.artists.map(artist => artist.id).sort(),
	album: track.album.name,
	duration: Math.round(track.duration_ms / 1000)
}))

function compareTrack (trackA: Track, trackB: Track, compareType: CompareType): boolean {
	const a = simplifyTrack(trackA)
	const b = simplifyTrack(trackB)

	if (a.id === b.id)
		return true
	if (!isEqual(a.artists, b.artists))
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
}

/**
 * Removes duplicates from an array of tracks.
 * @param tracks The tracklist to inspect.
 * @param compareType The comparison type. Note that tracks are always compared by track and artist id
 * @returns Returns the new tracklist with unique tracks.
 */
export function deduplicate (tracks: Track[], compareType = CompareType.SongId): Track[] {
	return  uniqWith(tracks, (a, b) => compareTrack(a, b, compareType))
}

/**
 * Removes tracks from one playlist to another
 * @param source The tracklist to inspect.
 * @param values The tracks to remove.
 * @param compareType The comparison type. Note that tracks are always compared by track and artist id
 * @returns Returns the tracklist with the tracks removed.
 */
export function pullTracks (source: Track[], tracksToRemove: Track[], compareType = CompareType.SongId): Track[] {
	return differenceWith(source, tracksToRemove, (a, b) => compareTrack(a, b, compareType))
}
