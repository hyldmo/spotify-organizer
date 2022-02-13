import { Join, PathsToStringProps, Split, ToStringProps, Traverse, User } from 'types'
import { Playlist, Track } from './spotify'

export interface FirebaseData {
	users: Record<User['id'], FirebaseUserData>
}

export type SongEntry = {
	skips?: number
	plays?: number
}

export type FirebaseUserData = Omit<User, 'id'> & {
	songs: {
		[id: Track['id']]: {
			[id: Playlist['uri']]: SongEntry
		}
	}
}

type FirebaseArrayPaths = PathsToStringProps<ToStringProps<FirebaseData>>

export type FirebaseUrls = Join<FirebaseArrayPaths, '/'>

export type FirebaseGet<T extends FirebaseUrls> = T extends `${infer F}/`
	? Traverse<FirebaseData, Split<F, '/'>>
	: Traverse<FirebaseData, Split<T, '/'>>

export type FirebaseUpdates = { [K in FirebaseUrls]?: unknown }
