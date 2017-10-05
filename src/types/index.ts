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

export type User = {
	name: string
	image: string
	token: string
}

export * from './scopes'
export * from './spotify'
