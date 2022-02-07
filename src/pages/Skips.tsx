import React from 'react'
import { useSelector } from 'react-redux'
import { State } from 'types'

export const Skips: React.FC = () => {
	const skips = useSelector((s: State) => s.playback.skips)
	const playlists = useSelector((s: State) => s.playlists)

	return (
		<div className="p-4">
			<h1 className="text-xl">Most skipped songs</h1>
			<ul>
				{skips
					.getAll()
					.sort((a, b) => b[1].totalSkips - a[1].totalSkips)
					.map(([key, value]) => (
						<li key={key} className="border-b border-b-gray-300 py-2">
							<div className="grid grid-cols-3 items-center space-x-2 border-b border-b-gray-600 p-2">
								<a href={value.song.album.uri} className="space-x-2">
									<img className="inline h-12" src={value.song.album.images[0].url} />
									<span>{value.song.album.name}</span>
								</a>
								<span className="justify-self-center">
									<span>{value.song?.name}</span>
									<span> - </span>
									<span>{value.song?.artists.map(a => a.name).join(', ')}</span>
								</span>

								<span className="justify-self-end">Skips: {value.totalSkips}</span>
							</div>
							<ul className="p-2">
								{value.playlists
									?.slice()
									.sort((a, b) => b.skips - a.skips)
									.map(entry => {
										const playlist = playlists.find(pl => pl.uri == entry.uri)
										return (
											<li key={entry.uri} className="flex justify-between">
												<span className="space-x-4">
													<a href={entry.uri !== 'unknown' ? entry.uri : undefined}>
														{playlist?.name || entry.uri}
													</a>
													{entry.uri !== 'unknown' && (
														<button className="opacity-80 hover:opacity-100">
															Remove song from list
														</button>
													)}
												</span>
												<span className="opacity-70">Skips: {entry.skips}</span>
											</li>
										)
									})}
							</ul>
						</li>
					))}
			</ul>
		</div>
	)
}
