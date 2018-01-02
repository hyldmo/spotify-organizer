import { Track } from '../../src/types'
import { deduplicate } from '../../src/utils'

function makeTrack (name: string, artist: string | string[], album: string, duration = 180000, id = ''): Partial<Track> {
	return {
		id,
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
		artists: [

		],
		duration_ms: duration,
		meta: {
			added_at: new Date().toISOString(),
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

it('removes tracks with same id', () => {
	const tracks: Array<Partial<Track>> = [
		makeTrack('song', 'artist', 'album', 0, 'id'),
		makeTrack('song', 'artist', 'album', 0, 'id')
	]

	const deduplicatedTracks = deduplicate(tracks as Track[])

	expect(deduplicatedTracks.length).toBe(1)
})
