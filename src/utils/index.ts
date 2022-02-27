import { Playlist, Track, URI } from '~/types'
import { PersistentCache } from './Cache'

export * from './actionCreator'
export * from './Cache'
export * from './deduplicate'
export * from './duration'
export * from './filterPlaylists'
export * from './firebase'
export * from './hooks'
export * from './parseQueryString'
export * from './partition'
export * from './playlist'
export * from './sleep'
export * from './sort'
export * from './spotify'
export * from './ui'
export * from './urlescape'

export const PlaylistCache = new PersistentCache<Playlist, URI<'playlist'>>('spotify:playlist')
export const SongCache = new PersistentCache<Track, Track['id']>('spotify:track')
;(window as any).PlaylistCache = PlaylistCache
;(window as any).SongCache = SongCache
