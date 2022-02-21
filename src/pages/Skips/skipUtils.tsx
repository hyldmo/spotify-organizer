import memoizee from 'memoizee'
import React from 'react'
import {
	FirebaseUserData,
	Nullable,
	Playlist,
	PlaylistSkipEntry,
	SkipStats as SkipStatsProps,
	Track,
	User
} from 'types'
import { SongCache } from 'utils'

// TODO: Load track from API when not found in cache
export const findSong = (id: Track['id']) => (id !== null ? SongCache.get(id) : null)

export const findPlays = memoizee((id: Track['id'], playlist: PlaylistSkipEntry) => {
	const track = playlist.songs?.find(t => t.id == id)
	if (track) return { ...track, plays: track.plays || 0, skips: track.skips || 0 }
	return { id, plays: 0, skips: 0 }
})

export const findPlaylist = memoizee((uri: string, playlists: Playlist[], owner?: Nullable<User>) =>
	playlists.find(pl => pl.uri == uri && (owner ? pl.owner.id == owner.id : true))
)

export const countSkips = (playlist: PlaylistSkipEntry) => playlist.songs.reduce((a, b) => a + (b.skips || 0), 0)

export function toEntries<K extends 'skips' | 'plays'>(
	entries: FirebaseUserData[K] | FirebaseUserData[K],
	key: K,
	playlists: Playlist[]
) {
	return Object.entries(entries).map(([playlistUri, songs]) => {
		const playlist = findPlaylist(playlistUri, playlists) || {
			uri: playlistUri as PlaylistSkipEntry['uri']
		}
		return {
			...playlist,
			songs: Object.entries(songs).map(([songId, value]) => ({
				id: songId,
				[key]: value
			}))
		}
	})
}

export type Props = {
	countNonPlaylists: boolean
	allPlaylists: boolean
	skipData: PlaylistSkipEntry[]
	filterIds?: string[]
}

export const SkipStats: React.FC<SkipStatsProps> = ({ skips = 0, plays = 0 }) => {
	plays = Math.max(skips, plays) // Adjust up plays as they can sometime be missed
	return (
		<>
			<span className="opacity-70 align-right">{skips}</span>
			<span className="opacity-70 text-xs">skips</span>
			<span className="opacity-70 ">/</span>
			<span className="opacity-70 align-right">{Math.min(plays)}</span>
			<span className="opacity-70 text-xs">plays</span>
			<span className="opacity-50 text-sm">({Math.round((skips / plays) * 100)}%)</span>
		</>
	)
}
