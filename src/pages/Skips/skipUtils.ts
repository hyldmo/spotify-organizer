import { merge as _merge } from 'lodash/fp'
import memoizee from 'memoizee'
import { FirebaseUserData, PlaylistSkipEntry, SkipStats as SkipStatsProps, Track, URI } from '~/types'
import { findPlaylist, SongCache } from '~/utils'

// TODO: Load track from API when not found in cache
export const findSong = (id: Track['id']) => (id !== null ? SongCache.get(id) : null)

export const findPlays = memoizee((id: Track['id'], playlist: PlaylistSkipEntry) => {
	const track = playlist.songs?.find(t => t.id == id)
	if (track) return { ...track, plays: track.plays || 0, skips: track.skips || 0 }
	return { id, plays: 0, skips: 0 }
})

export const countSkips = (playlist: PlaylistSkipEntry) => playlist.songs.reduce((a, b) => a + (b.skips || 0), 0)

type MergedSkipEntry = {
	[uri: URI]: {
		[songId: Track['id']]: SkipStatsProps
	}
}

export function toEntries (entries: MergedSkipEntry) {
	return Object.entries(entries).map(([playlistUri, songs]) => {
		const playlist = findPlaylist(playlistUri) || {
			uri: playlistUri as PlaylistSkipEntry['uri']
		}
		return {
			...playlist,
			songs: Object.entries(songs).map(([songId, value]) => ({
				id: songId,
				...value
			}))
		}
	})
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function objectMap<T extends {}> (obj: T, func: (value: T[typeof key], key: keyof T) => void) {
	return Object.entries(obj).reduce(
		(a, [key, value]) => ({
			...a,
			[key]: func(value as any, key as keyof T)
		}),
		{}
	)
}

export function merge (a: FirebaseUserData['plays'], b: FirebaseUserData['skips']) {
	const plays = objectMap(a, value => objectMap(value, entry => ({ plays: entry })))
	const skips = objectMap(b, value => objectMap(value, entry => ({ skips: entry })))
	return _merge(plays, skips)
}

export type Props = {
	countNonPlaylists: boolean
	allPlaylists: boolean
	skipData: PlaylistSkipEntry[]
	filterIds?: string[]
	minSkips: number
}
