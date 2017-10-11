import { Playlist } from './spotify'

type PlaylistKey = keyof Playlist | null | string
export type Filters = {
	playlists: {
		order: {
			key: PlaylistKey
			asc: boolean
		}
		text: string,
		ownedOnly: boolean,
		hideEmpty: boolean
	}
}
