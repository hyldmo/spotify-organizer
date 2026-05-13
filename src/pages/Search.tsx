import type React from 'react'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { ArtistLinks, UriLink } from '~/components/UriLink'
import { Sort, type State, type Track } from '~/types'
import { Duration, getNextSortMode, getSortIcon, SongCache } from '~/utils'

type SearchResult = Track & {
	playlistNames: string[]
}

type SortKey = 'name' | 'artist' | 'album' | 'duration' | 'in_playlists'

export const Search: React.FC = () => {
	const [query, setQuery] = useState('')
	const [sort, setSort] = useState<{ key: SortKey; mode: Sort }>({ key: 'name', mode: Sort.None })
	const playlists = useSelector((s: State) => s.playlists)

	const results = useMemo(() => {
		const trimmed = query.trim().toLowerCase()
		if (trimmed.length < 2) return []

		const matches: SearchResult[] = []
		for (const track of SongCache.values()) {
			const matchesName = track.name.toLowerCase().includes(trimmed)
			const matchesArtist = track.artists.some(a => a.name.toLowerCase().includes(trimmed))
			const matchesAlbum = track.album.name.toLowerCase().includes(trimmed)

			if (matchesName || matchesArtist || matchesAlbum) {
				// Find which playlists contain this track (on-demand scan per decision 4B)
				const playlistNames = playlists.filter(pl => pl.tracks.items[track.id] !== undefined).map(pl => pl.name)

				matches.push({ ...track, playlistNames })
			}

			if (matches.length >= 200) break
		}

		return matches
	}, [query, playlists])

	const sortedResults = useMemo(() => {
		if (sort.mode === Sort.None) return results
		const direction = sort.mode === Sort.Asc ? 1 : -1
		const value = (r: SearchResult): string | number => {
			switch (sort.key) {
				case 'name':
					return r.name.toLocaleLowerCase()
				case 'artist':
					return r.artists[0]?.name.toLocaleLowerCase() ?? ''
				case 'album':
					return r.album.name.toLocaleLowerCase()
				case 'duration':
					return r.duration_ms
				case 'in_playlists':
					return r.playlistNames.length
			}
		}
		return results.slice().sort((a, b) => {
			const va = value(a)
			const vb = value(b)
			if (va < vb) return -1 * direction
			if (va > vb) return 1 * direction
			return 0
		})
	}, [results, sort])

	const onSort = (key: SortKey) => setSort(prev => ({ key, mode: getNextSortMode(prev.key === key, prev.mode) }))

	const sortHeader = (label: string, key: SortKey) => (
		<th>
			<a onClick={() => onSort(key)}>{label}</a>
			&nbsp;{getSortIcon(sort.key === key, sort.mode)}
		</th>
	)

	return (
		<div className="max-h-full grid grid-rows-[auto,1fr] grid-cols-1">
			<header className="pt-4 px-4 space-y-2">
				<h2 className="text-2xl">Search Tracks</h2>
				<input
					type="text"
					className={[
						'w-full max-w-lg px-3 py-2 rounded bg-gray-800',
						'border-2 border-gray-600 hover:border-gray-400',
						'focus:border-gray-300 outline-none'
					].join(' ')}
					placeholder="&#xF002; Search by track, artist, or album..."
					value={query}
					onChange={e => setQuery(e.target.value)}
					autoFocus
				/>
				{query.length >= 2 && (
					<p className="text-sm text-gray-400">
						{results.length >= 200 ? '200+ results' : `${results.length} result(s)`}
						{results.length >= 200 && ' (showing first 200)'}
					</p>
				)}
				<hr className="mt-2 border-t-2 border-t-gray-300" />
			</header>

			<div className="overflow-y-scroll px-4">
				{query.length < 2 ? (
					<p className="py-4 text-gray-400">
						Type at least 2 characters to search across all your playlists.
					</p>
				) : results.length === 0 ? (
					<p className="py-4 text-gray-400">No tracks found.</p>
				) : (
					<table className="playlists w-full">
						<thead className="sticky top-0 bg-black">
							<tr>
								{sortHeader('Name', 'name')}
								{sortHeader('Artist', 'artist')}
								{sortHeader('Album', 'album')}
								{sortHeader('Duration', 'duration')}
								{sortHeader('In Playlists', 'in_playlists')}
							</tr>
						</thead>
						<tbody>
							{sortedResults.map((track, index) => (
								<tr key={track.id + index}>
									<td>
										<UriLink object={track} />
									</td>
									<td>
										<ArtistLinks artists={track.artists} />
									</td>
									<td>
										<UriLink object={track.album} />
									</td>
									<td>{new Duration(track.duration_ms).toMinutesString()}</td>
									<td>
										{track.playlistNames.length > 0 ? (
											<span
												className="text-sm text-gray-300"
												title={track.playlistNames.join(', ')}
											>
												{track.playlistNames.length} playlist
												{track.playlistNames.length !== 1 && 's'}
											</span>
										) : (
											<span className="text-sm text-gray-500">—</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	)
}
