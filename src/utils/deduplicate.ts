import { isEqual } from 'lodash'
import * as memoize from 'memoizee'
import { Track } from '../types'

export enum CompareType {
	SongId = 'SongId',
	Name = 'Name',
	NameAndAlbum = 'NameAndAlbum',
	NameAndDuration = 'NameAndDuration'
}

const simplifyTrack = memoize((track: Track) => ({
	id: track.id,
	name: track.name,
	artists: track.artists.map(artist => artist.id).sort(),
	album: track.album.name,
	duration: track.duration_ms
}))

export function compareTrack (trackA: Track, trackB: Track, compareType: CompareType): boolean {
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
			return a.name === b.name && Math.abs(a.duration - b.duration) < 1000
		default:
			return false
	}
}

/**
 * Removes duplicates from an array of tracks.
 * @param tracks The tracklist to inspect.
 * @param compareType The comparison type. Note that tracks are always compared by track and artist id
 * @returns Returns the tracks are duplicates.
 */
export function deduplicate (tracks: Track[], compareType = CompareType.SongId): Track[] {
	tracks = tracks.slice()
	return tracks
		.sort((a, b) => a.meta.index - b.meta.index)
		.filter((a, i) => {
			const track = tracks.find(b => compareTrack(a, b, compareType))
			return track !== undefined && track.meta.index !== i
		})
}

/**
 * Removes tracks from one playlist to another
 * @param source The tracklist to inspect.
 * @param compareType The comparison type. Note that tracks are always compared by track and artist id
 * @param tracksToRemove The tracks to remove from the source playlist.
 * @returns Returns the tracks that should be removed from source.
 */
export function pullTracks (source: Track[], compareType = CompareType.SongId, tracksToRemove: Track[]): Track[] {
	return source.filter(a => tracksToRemove.some(b => compareTrack(a, b, compareType)))
}
