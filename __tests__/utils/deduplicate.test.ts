import { Track } from '../../src/types'
import { CompareType, deduplicate, diffTracks } from '../../src/utils'

function makeArtist (name: string): SpotifyApi.ArtistObjectSimplified {
	return { id: name, name, href: '', type: 'artist', uri: '', external_urls: { spotify: '' } }
}

function makeTrack (name: string, artists: string | string[], album: string, duration = 180000, id?: string): Partial<Track> {
	return {
		id: id || (Math.random() * 9999999999).toString(),
		name,
		album: {
			album_type: '',
			external_urls: { spotify: '' },
			href: '',
			id: '',
			images: [],
			name: album,
			type: 'album',
			uri: ''
		},
		artists: artists instanceof Array
			? artists.map(a => makeArtist(a))
			: [ makeArtist(artists) ],
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
		const tracks: Array<Partial<Track>> = [
			makeTrack('song', 'artist', 'album', 0, 'id'),
			makeTrack('song', 'artist', 'album', 0, 'id')
		]

		const deduplicatedTracks = deduplicate(tracks as Track[])

		expect(deduplicatedTracks.length).toBe(1)
	})

	it('removes tracks with same name when compareMode is Name', () => {
		const tracks: Array<Partial<Track>> = [
			makeTrack('song', 'artist', 'album', 0),
			makeTrack('song', 'artist', 'album2', 1000)
		]

		const deduplicatedTracks = deduplicate(tracks as Track[], CompareType.Name)

		expect(deduplicatedTracks.length).toBe(1)
	})

	it('removes tracks with same name and album name when compareMode is NameAndAlbum', () => {
		const tracks: Array<Partial<Track>> = [
			makeTrack('song', 'artist', 'album', 0),
			makeTrack('song', 'artist', 'album', 1000),
			makeTrack('song', 'artist', 'album', 2000)
		]

		const deduplicatedTracks = deduplicate(tracks as Track[], CompareType.NameAndAlbum)

		expect(deduplicatedTracks.length).toBe(1)
	})

	it('removes tracks with same name and duration when compareMode is NameAndDuration', () => {
		const tracks: Array<Partial<Track>> = [
			makeTrack('song', 'artist', 'album', 4400),
			makeTrack('song', 'artist', 'album2', 4000),
			makeTrack('song', 'artist', 'album3', 4000)
		]

		const deduplicatedTracks = deduplicate(tracks as Track[], CompareType.NameAndDuration)

		expect(deduplicatedTracks.length).toBe(1)
	})
})

describe(diffTracks.name, () => {
	it('removes tracks with same id from other playlist', () => {
		const source: Array<Partial<Track>> = [
			makeTrack('song', 'artist', 'album', 0, 'id'),
			makeTrack('song', 'artist', 'album', 0, 'id2')
		]

		const tracksToRemove: Array<Partial<Track>> = [
			makeTrack('song', 'artist', 'album', 0, 'id2'),
			makeTrack('song', 'artist', 'album', 0, 'id3')
		]

		const deduplicatedTracks = diffTracks(source as Track[], tracksToRemove as Track[], CompareType.Id)

		expect(deduplicatedTracks).toEqual([
			makeTrack('song', 'artist', 'album', 0, 'id')
		])
	})

	it('removes tracks with same name and duration when compareMode is NameAndDuration', () => {
		const tracks: Array<Partial<Track>> = [
			makeTrack('song', 'artist', 'album', 4400),
			makeTrack('song', 'artist', 'album2', 4000),
			makeTrack('song', 'artist', 'album3', 4000)
		]

		const tracksToRemove: Array<Partial<Track>> = [
			makeTrack('song', 'artist', 'album', 4000)
		]

		const deduplicatedTracks = diffTracks(tracks as Track[], tracksToRemove as Track[], CompareType.NameAndDuration)

		expect(deduplicatedTracks).toEqual([])
	})
})
