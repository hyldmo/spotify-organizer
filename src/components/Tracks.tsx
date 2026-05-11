import React, { useMemo, useState } from 'react'
import { Actions } from '~/actions'
import { Playlist, Sort, Track } from '~/types'
import { canModifyPlaylist, Duration, getNextSortMode, getSortIcon, useAppDispatch, useAppSelector } from '~/utils'
import Button from './Button'
import { ArtistLinks, UriLink } from './UriLink'

type SortKey = 'name' | 'artist' | 'album' | 'added_by' | 'added_at' | 'duration' | 'in_playlists' | 'plays'

type Props = {
	tracks: Track[]
	playlist: Playlist
}

const Tracks: React.FC<Props> = ({ tracks, playlist }) => {
	const dispatch = useAppDispatch()
	const playlists = useAppSelector(s => s.playlists)
	const user = useAppSelector(s => s.user)
	const canModify = user ? canModifyPlaylist(playlist, user) : false

	const [sort, setSort] = useState<{ key: SortKey; mode: Sort }>({ key: 'added_at', mode: Sort.None })
	const [selected, setSelected] = useState<Set<string>>(new Set())

	const contributors = new Set(tracks.map(t => t.meta.added_by.id))
	const plays = tracks.reduce((a, t) => a + (t.meta.plays || 0), 0)
	const showAddedBy = contributors.size > 1

	const otherPlaylistsByTrack = useMemo(() => {
		const map: Record<Track['id'], Playlist[]> = {}
		const candidates = playlists.filter(pl => pl.id !== playlist.id && pl.tracks.lastFetched)
		for (const track of tracks) {
			map[track.id] = candidates.filter(pl => pl.tracks.items[track.id] !== undefined)
		}
		return map
	}, [playlists, tracks, playlist.id])

	const sortedTracks = useMemo(() => {
		if (sort.mode === Sort.None) return tracks
		const direction = sort.mode === Sort.Asc ? 1 : -1
		const value = (t: Track): string | number => {
			switch (sort.key) {
				case 'name':
					return t.name.toLocaleLowerCase()
				case 'artist':
					return t.artists[0]?.name.toLocaleLowerCase() ?? ''
				case 'album':
					return t.album.name.toLocaleLowerCase()
				case 'added_by':
					return getDisplayName(t.meta.added_by).toLocaleLowerCase()
				case 'added_at':
					return new Date(t.meta.added_at).getTime()
				case 'duration':
					return t.duration_ms
				case 'in_playlists':
					return otherPlaylistsByTrack[t.id]?.length ?? 0
				case 'plays':
					return t.meta.plays ?? 0
			}
		}
		return tracks.slice().sort((a, b) => {
			const va = value(a)
			const vb = value(b)
			if (va < vb) return -1 * direction
			if (va > vb) return 1 * direction
			return 0
		})
	}, [tracks, sort, otherPlaylistsByTrack])

	const allSelected = selected.size > 0 && selected.size === tracks.length
	const rowKey = (t: Track) => `${t.id}:${t.meta.index}`

	const toggleAll = (checked: boolean) =>
		setSelected(checked ? new Set(tracks.map(rowKey)) : new Set())

	const toggleRow = (key: string, checked: boolean) => {
		const next = new Set(selected)
		if (checked) next.add(key)
		else next.delete(key)
		setSelected(next)
	}

	const onDelete = () => {
		const uris = Array.from(
			new Set(tracks.filter(t => selected.has(rowKey(t))).map(t => t.uri))
		)
		if (uris.length === 0) return
		const confirm = window.confirm(
			`Remove ${selected.size} track${selected.size !== 1 ? 's' : ''} from ${playlist.name}?`
		)
		if (!confirm) return
		dispatch(Actions.deleteTracks(uris, { id: playlist.id, snapshot_id: playlist.snapshot_id }))
		setSelected(new Set())
	}

	if (tracks.length === 0) return <div>No tracks.</div>

	const onSort = (key: SortKey) =>
		setSort(prev => ({ key, mode: getNextSortMode(prev.key === key, prev.mode) }))

	const sortHeader = (label: string, key: SortKey, title?: string) => (
		<th title={title}>
			<a onClick={() => onSort(key)}>{label}</a>
			&nbsp;{getSortIcon(sort.key === key, sort.mode)}
		</th>
	)

	return (
		<>
			{canModify && (
				<div className="flex items-center gap-2 px-2 py-1 text-sm">
					<span className="opacity-80">
						{selected.size > 0 ? `${selected.size} selected` : 'Select tracks to remove'}
					</span>
					<Button
						icon="trash"
						disabled={selected.size === 0}
						onClick={onDelete}
						title="Remove selected tracks from this playlist"
					>
						Delete
					</Button>
				</div>
			)}
			<table className="playlists">
				<thead className="sticky top-0 bg-black">
					<tr>
						{canModify && (
							<th className="select">
								<input
									type="checkbox"
									checked={allSelected}
									onChange={e => toggleAll(e.target.checked)}
								/>
							</th>
						)}
						{sortHeader('Name', 'name')}
						{sortHeader('Artist', 'artist')}
						{sortHeader('Album', 'album')}
						{showAddedBy && sortHeader('Added by', 'added_by')}
						{sortHeader('Added at', 'added_at')}
						{sortHeader('Duration', 'duration')}
						{sortHeader('In playlists', 'in_playlists', 'Number of other loaded playlists this track appears in')}
						{sortHeader(
							'Plays',
							'plays',
							plays > 0 ? undefined : 'Plays are tracked only while "Watch skips" is enabled in settings'
						)}
					</tr>
				</thead>
				<tbody>
					{sortedTracks.map(track => {
						const key = rowKey(track)
						const others = otherPlaylistsByTrack[track.id] || []
						return (
							<tr key={key}>
								{canModify && (
									<td className="select">
										<input
											type="checkbox"
											checked={selected.has(key)}
											onChange={e => toggleRow(key, e.target.checked)}
										/>
									</td>
								)}
								<td>
									<UriLink object={track} />
								</td>
								<td>
									<ArtistLinks artists={track.artists} />
								</td>
								<td>
									<UriLink object={track.album} />
								</td>
								{showAddedBy && (
									<td>
										<UriLink object={track.meta.added_by}>
											{getDisplayName(track.meta.added_by)}
										</UriLink>
									</td>
								)}
								<td>{new Date(track.meta.added_at).toLocaleDateString()}</td>
								<td>{new Duration(track.duration_ms).toMinutesString()}</td>
								<td title={others.map(pl => pl.name).join('\n')}>{others.length}</td>
								<td>{track.meta.plays ?? 0}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</>
	)
}

function getDisplayName (addedBy: Track['meta']['added_by']): string {
	return addedBy === null ? 'Spotify' : addedBy.display_name || addedBy.id
}

export default Tracks
