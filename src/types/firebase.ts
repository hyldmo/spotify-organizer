import type { Join, PathsToStringProps, Split, ToStringProps, Traverse, User } from '~/types'
import type { Track, URI } from './spotify'

export type IDKey = 'uid'

export interface FirebaseData {
	users: Record<User[IDKey], FirebaseUserData>
}

export type SongEntries = {
	[id: Track['id']]: number // number of plays
}

export interface FirebaseUserData extends Omit<User, IDKey> {
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
