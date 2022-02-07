/* eslint-disable max-len */
import { startCase } from 'lodash/fp'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'types'
import { isPlaylist } from 'utils'
import { Time } from './Time'
import { ArtistLinks } from './UriLink'

export const Footer: React.FC = () => {
	const playback = useSelector((s: State) => s.playback.nowPlaying)
	const playlists = useSelector((s: State) => s.playlists)
	const context = playback?.context
	const [progress, setProgress] = useState(playback?.progress_ms || 0)
	const song = playback?.item
	const currentPlaylist = playlists.find(pl => pl.uri == context?.uri)

	useEffect(() => {
		// Update music counter every second
		const progressMs = Math.min(Math.floor((playback?.progress_ms || 0) / 1000), playback?.item.duration_ms || 0)
		setProgress(progressMs * 1000)
		if (playback?.is_playing) {
			const interval = setInterval(() => setProgress(p => p + 1000), 1000)
			return () => {
				clearInterval(interval)
			}
		}
	}, [playback?.progress_ms, playback?.is_playing, playback?.item.duration_ms])

	return (
		<footer>
			{playback?.currently_playing_type == 'track' && song && (
				<div className="grid grid-rows-[1fr,1fr,auto] grid-cols-[auto,auto,auto,1fr,6fr,1fr,auto] px-2 py-3 gap-x-4 items-center">
					<a className="row-start-1 row-span-2" href={context?.uri || playback.item.uri}>
						<img className="h-16" src={song.album.images[0]?.url} alt="" />
					</a>
					<span className="col-start-2 row-start-1 self-end ellipsis">
						<a href={song.album.uri}>{song.name}</a>
					</span>
					<ArtistLinks artists={song.album.artists} className="col-start-2 row-start-2 self-start text-xs" />
					<button className="col-start-3 row-span-2" type="button" role="switch">
						<svg height="16" viewBox="0 0 16 16" className="text-transparent hover:text-white">
							<path fill="none" d="M0 0h16v16H0z"></path>
							<path
								stroke="#fff"
								d="M13.797 2.727a4.057 4.057 0 00-5.488-.253.558.558 0 01-.31.112.531.531 0 01-.311-.112 4.054 4.054 0 00-5.487.253c-.77.77-1.194 1.794-1.194 2.883s.424 2.113 1.168 2.855l4.462 5.223a1.791 1.791 0 002.726 0l4.435-5.195a4.052 4.052 0 001.195-2.883 4.057 4.057 0 00-1.196-2.883z"
							></path>
						</svg>
					</button>
					<div className="col-start-5 row-start-1 text-white flex justify-center space-x-4 min-w-[20rem]">
						<button className={playback.shuffle_state ? 'text-green-500' : ''}>
							<svg height="16" viewBox="0 0 16 16">
								<path d="M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z"></path>
							</svg>
						</button>
						<button>
							<svg height="16" viewBox="0 0 16 16">
								<path d="M13 2.5L5 7.119V3H3v10h2V8.881l8 4.619z"></path>
							</svg>
						</button>
						<button>
							<svg height="16" viewBox="0 0 16 16">
								<path fill="none" d="M0 0h16v16H0z"></path>
								<path d="M3 2h3v12H3zm7 0h3v12h-3z"></path>
							</svg>
						</button>
						<button>
							<svg height="16" viewBox="0 0 16 16">
								<path d="M11 3v4.119L3 2.5v11l8-4.619V13h2V3z"></path>
							</svg>
						</button>
						<button className={playback.repeat_state ? 'text-green-500' : ''}>
							<svg height="16" viewBox="0 0 16 16">
								<path d="M5.5 5H10v1.5l3.5-2-3.5-2V4H5.5C3 4 1 6 1 8.5c0 .6.1 1.2.4 1.8l.9-.5C2.1 9.4 2 9 2 8.5 2 6.6 3.6 5 5.5 5zm9.1 1.7l-.9.5c.2.4.3.8.3 1.3 0 1.9-1.6 3.5-3.5 3.5H6v-1.5l-3.5 2 3.5 2V13h4.5C13 13 15 11 15 8.5c0-.6-.1-1.2-.4-1.8z" />
							</svg>
						</button>
					</div>
					<div className="col-start-5 row-start-2 flex items-center space-x-2">
						<Time className="text-right" ms={progress} />
						<input
							className="w-full"
							type="range"
							min={0}
							max={song.duration_ms}
							step={1000}
							value={progress}
						/>
						<Time ms={song.duration_ms} />
					</div>
					<div className="col-start-7 row-span-2 flex items-center space-x-2 text-gray-700">
						<button>
							<svg height="16" viewBox="0 0 16 16">
								<path d="M8.5 1A4.505 4.505 0 004 5.5c0 .731.191 1.411.502 2.022L1.99 13.163a1.307 1.307 0 00.541 1.666l.605.349a1.307 1.307 0 001.649-.283L9.009 9.95C11.248 9.692 13 7.807 13 5.5 13 3.019 10.981 1 8.5 1zM4.023 14.245a.307.307 0 01-.388.066l-.605-.349a.309.309 0 01-.128-.393l2.26-5.078A4.476 4.476 0 007.715 9.92l-3.692 4.325zM8.5 9C6.57 9 5 7.43 5 5.5S6.57 2 8.5 2 12 3.57 12 5.5 10.429 9 8.5 9z" />
							</svg>
						</button>
						<button>
							<svg height="16" viewBox="0 0 16 16">
								<path d="M2 2v5l4.33-2.5L2 2zm0 12h14v-1H2v1zm0-4h14V9H2v1zm7-5v1h7V5H9z"></path>
							</svg>
						</button>
						<button>
							<svg height="16" viewBox="0 0 16 16">
								<path d="M12 .999H4c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V2c0-.55-.45-1.001-1-1.001zM12 14H4V2h8v12z"></path>
								<circle cx="7.984" cy="12.482" r=".75"></circle>
							</svg>
						</button>
						<button>
							<svg role="presentation" height="16" width="16" id="volume-icon" viewBox="0 0 16 16">
								<path d="M12.945 1.379l-.652.763c1.577 1.462 2.57 3.544 2.57 5.858s-.994 4.396-2.57 5.858l.651.763a8.966 8.966 0 00.001-13.242zm-2.272 2.66l-.651.763a4.484 4.484 0 01-.001 6.397l.651.763c1.04-1 1.691-2.404 1.691-3.961s-.65-2.962-1.69-3.962zM0 5v6h2.804L8 14V2L2.804 5H0zm7-1.268v8.536L3.072 10H1V6h2.072L7 3.732z"></path>
							</svg>
						</button>
						<input type="range" min={0} max={100} step="1" value={playback.device.volume_percent || 100} />
						<button>
							<svg height="16" viewBox="0 0 16 16">
								<path d="M6.064 10.229l-2.418 2.418L2 11v4h4l-1.647-1.646 2.418-2.418-.707-.707zM11 2l1.647 1.647-2.418 2.418.707.707 2.418-2.418L15 6V2h-4z"></path>
							</svg>
						</button>
					</div>
				</div>
			)}
			<div className="bg-green-600 px-2 grid grid-cols-[auto,1fr,auto] ">
				<span className="col-start-1 space-x-1">
					<a href={process.env.PACKAGE_REPOSITORY} target="_blank" rel="noreferrer">
						{startCase(process.env.PACKAGE_NAME)}
					</a>
					<a
						href={`${process.env.PACKAGE_REPOSITORY}/releases/tag/v${process.env.PACKAGE_VERSION}`}
						target="_blank"
						rel="noreferrer"
					>
						v{process.env.PACKAGE_VERSION}
					</a>
				</span>

				{playback && (
					<span className="col-start-2 text-center">
						<span>Playing on {playback.device.name} </span>
						{isPlaylist(context) && (
							<span className="text-green-200">
								(Playlist:{' '}
								<a className="text-green-200 hover:text-white" href={context.uri}>
									{currentPlaylist?.name || 'Unknown'}
								</a>
								)
							</span>
						)}
					</span>
				)}

				<span className="col-start-3 text-right">
					<a href={`${process.env.PACKAGE_REPOSITORY}/issues/new`} target="_blank" rel="noreferrer">
						Send Feedback
					</a>
				</span>
			</div>
		</footer>
	)
}
