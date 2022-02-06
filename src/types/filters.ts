import { Playlist, Sort } from './spotify'

type PlaylistKey = keyof Playlist | string
export type Filters = {
	playlists: {
		order: {
			key: PlaylistKey
			mode: Sort
		}
		text: string
		ownedOnly: boolean
		hideEmpty: boolean
	}
}
