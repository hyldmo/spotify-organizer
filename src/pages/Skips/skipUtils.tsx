import React from 'react'
import memoizee from 'memoizee'
import { Nullable, Playlist, PlaylistSkipEntry, SkipStats as SkipStatsProps, Track, User } from 'types'

export const findSong = memoizee((id: Track['id'], playlists: Playlist[]) => {
	for (const playlist of playlists) {
		const track = playlist.tracks?.items?.find(t => t.id == id)
		if (track) return track
	}
	return undefined
})

export const findPlays = memoizee((id: Track['id'], playlist: PlaylistSkipEntry) => {
	const track = playlist.songs?.find(t => t.id == id)
	if (track) return { ...track, plays: track.plays || 0, skips: track.skips || 0 }
	return { id, plays: 0, skips: 0 }
})

export const findPlaylist = memoizee((uri: string, playlists: Playlist[], owner?: Nullable<User>) =>
	playlists.find(pl => pl.uri == uri && (owner ? pl.owner.id == owner.id : true))
)

export const countSkips = (playlist: PlaylistSkipEntry) => playlist.songs.reduce((a, b) => a + (b.skips || 0), 0)

export type Props = {
	countNonPlaylists: boolean
	allPlaylists: boolean
	skipData: PlaylistSkipEntry[]
}

export const SkipStats: React.FC<SkipStatsProps> = ({ skips = 0, plays = 0 }) => (
	<span className="opacity-70 space-x-1 justify-end">
		{plays == 1 ? (
			<>
				<span>{skips} skips</span>
				<span>/</span>
				<span>{plays} plays</span>
			</>
		) : (
			<>
				<span>Skipped:</span>
				<span>{Math.min(100, Math.round((skips / plays) * 100))}%</span>
			</>
		)}
	</span>
)
