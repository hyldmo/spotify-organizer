import { Track } from '../../src/types'
import { compareTrack, CompareType, deduplicate, pullTracks } from '../../src/utils'

// Used for originalPosition of tracks (deduplicate uses it to make sure you don't remove all duplicate version of track, keeping the original)
let i = 0
beforeEach(() => { i = 0 })

function makeTrack (name: string, artists: string | string[], album: string, duration = 180000, id?: string, order?: number): Track {
	return {
		id: id || (Math.random() * 9999999999).toString(),
		name,
		album: {
			id: '',
			name: album
		},
		artists: artists instanceof Array
			? artists.map(a => ({ id: a, name: a }))
			: [{ id: artists, name: artists }],
		duration_ms: duration,
		meta: {
			added_at: '',
			added_by: {
				external_urls: {
					spotify: ''
				},
				href: '',
				id: '',
				type: 'user',
				uri: ''
			},
			is_local: false,
			index: order || i++
		}
	}
}

describe(compareTrack, () => {
	it('returns true when compareType is SongId and IDs are equal', () => {
		const a = makeTrack('song', 'artist', 'album', 0, 'id')
		const b = makeTrack('song2', 'artist3', 'album4', 1, 'id')

		const result = compareTrack(a, b, CompareType.SongId)

		expect(result).toBe(true)
	})

	it('returns false when compareType is SongId and everything but IDs are equal' , () => {
		const a = makeTrack('song', 'artist', 'album', 0)
		const b = makeTrack('song', 'artist', 'album', 0)

		const result = compareTrack(a, b, CompareType.SongId)

		expect(result).toBe(false)
	})

	it('returns false when compareType is Name and everything but ID and Artist are equal' , () => {
		const a = makeTrack('song', 'artist', 'album', 100)
		const b = makeTrack('song', 'artist2', 'album', 0)

		const result = compareTrack(a, b, CompareType.Name)

		expect(result).toBe(false)
	})

	it('returns true when compareType is Name and names are equal', () => {
		const a = makeTrack('song', 'artist', 'album', 100)
		const b = makeTrack('song', 'artist', 'album2', 0)

		const result = compareTrack(a, b, CompareType.Name)

		expect(result).toBe(true)
	})

	it('returns true when compareType is NameAndAlbum and name and album are equal', () => {
		const a = makeTrack('song', 'artist', 'album', 100)
		const b = makeTrack('song', 'artist', 'album', 0)

		const result = compareTrack(a, b, CompareType.NameAndAlbum)

		expect(result).toBe(true)
	})

	it('returns false when compareType is Name and name is equal but album is different', () => {
		const a = makeTrack('song', 'artist', 'album')
		const b = makeTrack('song', 'artist', 'album2')

		const result = compareTrack(a, b, CompareType.NameAndAlbum)

		expect(result).toBe(false)
	})

	it('returns true when compareType is NameAndDuration and name and duration are equal', () => {
		const a = makeTrack('song', 'artist', 'album', 100)
		const b = makeTrack('song', 'artist', 'album5', 100)

		const result = compareTrack(a, b, CompareType.NameAndDuration)

		expect(result).toBe(true)
	})

	it('returns true when compareType is NameAndDuration and duration is within 1s difference', () => {
		const a = makeTrack('song', 'artist', 'album',  4400, 'id1')
		const b = makeTrack('song', 'artist', 'album5', 5300, 'id2')

		const result = compareTrack(a, b, CompareType.NameAndDuration)

		expect(result).toBe(true)
	})

	it('returns false when compareType is NameAndDuration and name is equal but album is different', () => {
		const a = makeTrack('song', 'artist', 'album', 10000)
		const b = makeTrack('song', 'artist', 'album', 5)

		const result = compareTrack(a, b, CompareType.NameAndDuration)

		expect(result).toBe(false)
	})
})

describe(deduplicate, () => {

	it('removes tracks with same id', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 0, 'id'),
			makeTrack('song', 'artist', 'album', 0, 'id'),
			makeTrack('song', 'artist', 'album', 0, 'id')
		]

		const deduplicatedTracks = deduplicate(tracks)

		expect(deduplicatedTracks).toEqual([tracks[1], tracks[2]])
	})

	it('sorts tracks before removing them', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 0, 'id', 2),
			makeTrack('song', 'artist', 'album', 0, 'id', 1),
			makeTrack('song', 'artist', 'album', 0, 'id', 0)
		]

		const deduplicatedTracks = deduplicate(tracks)

		expect(deduplicatedTracks).toEqual([tracks[1], tracks[0]])
	})

	it('removes tracks with same name when compareType is Name', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 0),
			makeTrack('song', 'artist', 'album2', 1000)
		]

		const deduplicatedTracks = deduplicate(tracks, CompareType.Name)

		expect(deduplicatedTracks).toEqual([tracks[1]])
	})

	it('removes tracks with same name and album name when compareType is NameAndAlbum', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 0),
			makeTrack('song', 'artist', 'album', 1000),
			makeTrack('song', 'artist', 'album', 2000)
		]

		const deduplicatedTracks = deduplicate(tracks, CompareType.NameAndAlbum)

		expect(deduplicatedTracks).toEqual([tracks[1], tracks[2]])
	})

	it('removes tracks with same name and duration when compareType is NameAndDuration', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 4400),
			makeTrack('song', 'artist', 'album2', 4000),
			makeTrack('song', 'artist', 'album3', 4000)
		]

		const deduplicatedTracks = deduplicate(tracks, CompareType.NameAndDuration)

		expect(deduplicatedTracks).toEqual([tracks[1], tracks[2]])
	})
})

describe(pullTracks.name, () => {
	it('removes tracks with same id from other playlist', () => {
		const source: Track[] = [
			makeTrack('song', 'artist', 'album', 0, 'id'),
			makeTrack('song', 'artist', 'album', 0, 'id2')
		]

		const tracksToRemove: Track[] = [
			makeTrack('song', 'artist', 'album', 0, 'id2'),
			makeTrack('song', 'artist', 'album', 0, 'id3')
		]

		const deduplicatedTracks = pullTracks(source, CompareType.SongId, tracksToRemove)

		expect(deduplicatedTracks).toEqual([source[1]])
	})
	it('removes tracks with same name and duration when compareType is NameAndDuration', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album',  8000, 'id1'),
			makeTrack('song', 'artist', 'album2', 4000, 'id2'),
			makeTrack('song', 'artist', 'album3', 4000, 'id3')
		]

		const tracksToRemove: Track[] = [
			makeTrack('song', 'artist', 'album5', 4000)
		]

		const deduplicatedTracks = pullTracks(tracks, CompareType.NameAndDuration, tracksToRemove)
		expect(deduplicatedTracks.map(t => t.id)).toEqual([tracks[1].id, tracks[2].id])
	})
})
