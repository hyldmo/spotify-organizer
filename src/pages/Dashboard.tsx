import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from '~/types'
import { Duration, SongCache, songEntriesToSongs, useFirebase } from '~/utils'

export const Dashboard: React.FC = () => {
	const playlists = useSelector((s: State) => s.playlists)
	const user = useSelector((s: State) => s.user)
	const plays = useFirebase(`users/${user?.uid}/plays/`) || {}
	const skips = useFirebase(`users/${user?.uid}/skips/`) || {}

	const stats = useMemo(() => {
		const totalTracks = playlists.reduce((a, b) => a + b.tracks.total, 0)
		const loadedPlaylists = playlists.filter(pl => pl.tracks.loaded === pl.tracks.total)
		const tracks = loadedPlaylists.flatMap(pl => songEntriesToSongs(pl.tracks.items))
		const totalDuration = tracks.reduce((a, b) => a + b.duration_ms, 0)

		// Count duplicates (tracks appearing in multiple playlists)
		const trackCounts = new Map<string, number>()
		for (const pl of loadedPlaylists) {
			for (const id of Object.keys(pl.tracks.items)) {
				trackCounts.set(id, (trackCounts.get(id) || 0) + 1)
			}
		}
		const duplicateCount = Array.from(trackCounts.values()).filter(c => c > 1).length

		// Unique tracks
		const uniqueTracks = trackCounts.size

		// Skip stats per playlist
		const playlistSkipRates = loadedPlaylists
			.map(pl => {
				const contextUri = pl.uri
				const playlistSkips = skips[contextUri] || {}
				const playlistPlays = plays[contextUri] || {}
				const totalSkips = Object.values(playlistSkips).reduce<number>((a, b) => a + (Number(b) || 0), 0)
				const totalPlays = Object.values(playlistPlays).reduce<number>((a, b) => a + (Number(b) || 0), 0)
				const skipRate = totalPlays > 0 ? totalSkips / totalPlays : 0
				return { name: pl.name, id: pl.id, skipRate, totalSkips, totalPlays }
			})
			.filter(pl => pl.totalPlays > 0)
			.sort((a, b) => b.skipRate - a.skipRate)

		// Most skipped tracks (aggregate across all playlists)
		const trackSkips = new Map<string, number>()
		for (const contextSkips of Object.values(skips)) {
			if (typeof contextSkips !== 'object' || contextSkips === null) continue
			for (const [trackId, count] of Object.entries(contextSkips)) {
				trackSkips.set(trackId, (trackSkips.get(trackId) || 0) + (Number(count) || 0))
			}
		}
		const mostSkipped = Array.from(trackSkips.entries())
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10)

		return {
			totalPlaylists: playlists.length,
			loadedPlaylists: loadedPlaylists.length,
			totalTracks,
			uniqueTracks,
			totalDuration,
			duplicateCount,
			playlistSkipRates,
			mostSkipped
		}
	}, [playlists, plays, skips])

	if (!user) return null

	return (
		<div className="max-h-full grid grid-rows-[auto,1fr] grid-cols-1">
			<header className="pt-4 px-4 space-y-4">
				<h2 className="text-2xl">Library Dashboard</h2>

				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					<StatCard label="Playlists" value={stats.totalPlaylists} />
					<StatCard label="Total Tracks" value={stats.totalTracks} />
					<StatCard label="Unique Tracks" value={stats.uniqueTracks || '—'} />
					<StatCard label="Total Duration" value={new Duration(stats.totalDuration).toString('hours')} />
				</div>

				{stats.duplicateCount > 0 && (
					<div className="p-3 rounded border border-yellow-600 bg-yellow-900/20 text-yellow-200">
						<strong>{stats.duplicateCount}</strong> track{stats.duplicateCount !== 1 && 's'} appear in multiple
						playlists.{' '}
						<Link to="/" className="underline">
							Go to Playlists
						</Link>{' '}
						to deduplicate.
					</div>
				)}

				<hr className="border-t-2 border-t-gray-300" />
			</header>

			<div className="overflow-y-scroll px-4 py-4 space-y-6">
				{stats.playlistSkipRates.length > 0 && (
					<section>
						<h3 className="text-lg font-semibold mb-2">Highest Skip Rates</h3>
						<table className="w-full max-w-2xl">
							<thead>
								<tr className="text-left text-gray-400 text-sm">
									<th>Playlist</th>
									<th className="text-right">Skip Rate</th>
									<th className="text-right">Skips</th>
									<th className="text-right">Plays</th>
								</tr>
							</thead>
							<tbody>
								{stats.playlistSkipRates.slice(0, 10).map(pl => (
									<tr key={pl.id}>
										<td>
											<Link to={`/playlists/${pl.id}`} className="hover:underline">
												{pl.name}
											</Link>
										</td>
										<td className="text-right">{Math.round(pl.skipRate * 100)}%</td>
										<td className="text-right text-gray-400">{pl.totalSkips}</td>
										<td className="text-right text-gray-400">{pl.totalPlays}</td>
									</tr>
								))}
							</tbody>
						</table>
						<Link to="/skips" className="text-sm text-gray-400 hover:underline mt-1 inline-block">
							View all skipped songs →
						</Link>
					</section>
				)}

				{stats.mostSkipped.length > 0 && (
					<section>
						<h3 className="text-lg font-semibold mb-2">Most Skipped Tracks</h3>
						<ol className="space-y-1 max-w-2xl">
							{stats.mostSkipped.map(([trackId, count], i) => {
								const track = SongCache.get(trackId)
								return (
									<li key={trackId} className="flex justify-between text-sm">
										<span>
											<span className="text-gray-500 mr-2">{i + 1}.</span>
											<Link to={`/tracks/${trackId}`} className="hover:underline">
												{track ? `${track.name} — ${track.artists.map(a => a.name).join(', ')}` : trackId}
											</Link>
										</span>
										<span className="text-gray-400">{count} skip{count !== 1 && 's'}</span>
									</li>
								)
							})}
						</ol>
					</section>
				)}

				{stats.loadedPlaylists < stats.totalPlaylists && (
					<p className="text-sm text-gray-500">
						{stats.loadedPlaylists} of {stats.totalPlaylists} playlists fully loaded. Stats will update as more
						playlists are cached.
					</p>
				)}
			</div>
		</div>
	)
}

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
	<div className="p-3 rounded border border-gray-600 bg-gray-800/50">
		<div className="text-2xl font-bold">{value}</div>
		<div className="text-sm text-gray-400">{label}</div>
	</div>
)
