import cn from 'classnames'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { SkipEntry, State } from 'types'
import { ArtistLinks, UriLink } from 'components/UriLink'
import memoizee from 'memoizee'

const findPlaylist = memoizee((uri: string, playlists: State['playlists']) => playlists.find(pl => pl.uri == uri))

export const Skips: React.FC = () => {
	const skips = useSelector((s: State) => Object.values(s.skips as Record<string, SkipEntry>))
	const playlists = useSelector((s: State) => s.playlists)
	const user = useSelector((s: State) => s.user)
	const [nonPlaylists, countNonPlaylists] = useState(false)
	const [allPlaylists, showAllPlaylists] = useState(false)

	return (
		<div className="px-4 pt-4">
			<header className="pb-4 grid grid-cols-[auto, auto] justify-between items-start">
				<h2 className="col-start-1 text-2xl self-end">Most skipped songs</h2>
				<ul className="col-start-2">
					<li>
						<label className="flex items-center gap-x-2">
							<input
								type="checkbox"
								checked={nonPlaylists}
								onChange={e => countNonPlaylists(e.target.checked)}
							/>
							Hide skips in non-playlists
						</label>
					</li>
					<li>
						<label className="flex items-center gap-x-2">
							<input
								type="checkbox"
								checked={allPlaylists}
								onChange={e => showAllPlaylists(e.target.checked)}
							/>
							Show all playlists the songs belong to
						</label>
					</li>
				</ul>
				<p>
					Keep this app on while listening on Spotify, and it will detect which songs you&apos;re skipping and
					from which playlists.
				</p>
			</header>
			<ul>
				{skips
					.sort((a, b) => b.totalSkips - a.totalSkips)
					.map(({ song, ...value }, i) => {
						const playlistsSkips = value.playlists
							?.slice()
							.filter(p => (nonPlaylists ? findPlaylist(p.uri, playlists) : true))

						if (allPlaylists)
							playlistsSkips.push(
								...playlists
									.filter(pl => playlistsSkips.some(s => s.uri !== pl.uri))
									.filter(pl => pl.tracks.items?.find(track => track.id == song.id))
									.map(pl => ({ skips: 0, name: pl.name, uri: pl.uri }))
							)

						playlistsSkips.sort((a, b) => b.skips - a.skips)

						const filteredSkips = playlistsSkips.reduce((a, b) => a + b.skips, 0)
						if (filteredSkips == 0) return null
						return (
							<li
								key={song.id}
								className={cn('py-2', { 'border-b border-b-gray-300': i < skips.length - 1 })}
							>
								<div className="grid grid-rows-2 grid-cols-[auto,3fr,2fr,1fr] items-center space-x-2 border-b border-b-gray-600 p-2">
									<UriLink object={song.album} className="row-span-2 space-x-2">
										<img className="inline h-12" src={song.album.images[0].url} />
									</UriLink>
									<UriLink object={song} className="col-start-2 row-start-1" />
									<UriLink
										object={song.album}
										className="col-start-2 row-start-2 ellipsis opacity-60"
									/>

									<ArtistLinks
										artists={song?.artists}
										className="col-start-3 row-span-2 justify-self-center"
									/>

									<span className="col-start-4 row-span-2 justify-self-end">
										Total skips: {value.totalSkips}
									</span>
								</div>
								<ul className="p-2">
									{playlistsSkips.map(entry => {
										const playlist = findPlaylist(entry.uri, playlists)
										return (
											<li key={entry.uri} className="flex justify-between">
												<span className="space-x-4">
													{entry.uri !== 'unknown' ? (
														<>
															<a href={entry.uri}>{playlist?.name || entry.uri}</a>
															{playlist?.owner.id == user?.id && (
																<button className="opacity-80 hover:opacity-100">
																	Remove song from this list
																</button>
															)}
														</>
													) : (
														<span>Unknown playlist</span>
													)}
												</span>
												<span className="opacity-70">Skips: {entry.skips}</span>
											</li>
										)
									})}
								</ul>
							</li>
						)
					})}
			</ul>
		</div>
	)
}
