import { Track } from '../../src/types'
import { CompareType, deduplicate, pullTracks } from '../../src/utils'

function makeTrack (name: string, artists: string | string[], album: string, duration = 180000, id?: string): Track {
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
			is_local: false
		}
	}
}

describe(deduplicate.name, () => {
	it('removes tracks with same id', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 0, 'id'),
			makeTrack('song', 'artist', 'album', 0, 'id')
		]

		const deduplicatedTracks = deduplicate(tracks)

		expect(deduplicatedTracks).toEqual([tracks[0]])
	})

	it('removes tracks with same name when compareMode is Name', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 0),
			makeTrack('song', 'artist', 'album2', 1000)
		]

		const deduplicatedTracks = deduplicate(tracks, CompareType.Name)

		expect(deduplicatedTracks).toEqual([tracks[0]])
	})

	it('removes tracks with same name and album name when compareMode is NameAndAlbum', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 0),
			makeTrack('song', 'artist', 'album', 1000),
			makeTrack('song', 'artist', 'album', 2000)
		]

		const deduplicatedTracks = deduplicate(tracks, CompareType.NameAndAlbum)

		expect(deduplicatedTracks).toEqual([tracks[0]])
	})

	it('removes tracks with same name and duration when compareMode is NameAndDuration', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 4400),
			makeTrack('song', 'artist', 'album2', 4000),
			makeTrack('song', 'artist', 'album3', 4000)
		]

		const deduplicatedTracks = deduplicate(tracks, CompareType.NameAndDuration)

		expect(deduplicatedTracks).toEqual([tracks[0]])
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

		const deduplicatedTracks = pullTracks(source, tracksToRemove, CompareType.SongId)

		expect(deduplicatedTracks).toEqual([source[0]])
	})

	it('removes tracks with same name and duration when compareMode is NameAndDuration', () => {
		const tracks: Track[] = [
			makeTrack('song', 'artist', 'album', 4400),
			makeTrack('song', 'artist', 'album2', 4000),
			makeTrack('song', 'artist', 'album3', 4000)
		]

		const tracksToRemove: Track[] = [
			makeTrack('song', 'artist', 'album', 4000)
		]

		const deduplicatedTracks = pullTracks(tracks, tracksToRemove, CompareType.NameAndDuration)

		expect(deduplicatedTracks).toEqual([])
	})
})
