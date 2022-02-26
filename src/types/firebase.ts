import { Join, PathsToStringProps, Split, ToStringProps, Traverse, User } from '~/types'
import { Track, URI } from './spotify'

export interface FirebaseData {
	users: Record<User['id'], FirebaseUserData>
}

export type SongEntries = {
	[id: Track['id']]: number // number of plays
}

export type FirebaseUserData = Omit<User, 'id'> & {
	skips: {
		[id: URI]: SongEntries
	}
	plays: {
		[id: URI]: SongEntries
	}
}

type FirebaseArrayPaths = PathsToStringProps<ToStringProps<FirebaseData>>

export type FirebaseUrls = Join<FirebaseArrayPaths, '/'>

export type FirebaseGet<T extends FirebaseUrls> = T extends `${infer F}/`
	? Traverse<FirebaseData, Split<F, '/'>>
	: Traverse<FirebaseData, Split<T, '/'>>

export type FirebaseUpdates = { [K in FirebaseUrls]?: unknown }
