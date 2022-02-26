import cn from 'classnames'
import { startCase } from 'lodash/fp'
import React from 'react'
import { useSelector } from 'react-redux'
import { UriLink } from '~/components/UriLink'
import { Playback, State } from '~/types'
import { isPlaylist } from '~/utils'

type StatusBarProps = {
	playback: Playback | null
}
export const StatusBar: React.FC<StatusBarProps> = ({ playback }) => {
	const playlists = useSelector((s: State) => s.playlists)
	const currentPlaylist = playlists.find(pl => pl.uri == playback?.context?.uri)
	return (
		<div
			className={cn(
				'bg-green-600 p-2 gap-2 grid items-center',
				'grid-flow-row sm:grid-flow-col sm:grid-cols-[auto,1fr,auto]'
			)}
		>
			{playback && (
				<span className="col-span-2 sm:col-span-1 sm:col-start-2 text-center">
					<span>Playing on {playback.device.name} </span>
					{isPlaylist(playback.context) && (
						<span className="text-green-200 whitespace-nowrap">
							(Playlist:{' '}
							<UriLink className="text-green-200 hover:text-white" object={playback.context}>
								{currentPlaylist?.name || 'Unknown'}
							</UriLink>
							)
						</span>
					)}
				</span>
			)}

			<span className="sm:col-start-1 space-x-1">
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

			<span className="text-right">
				<a href={`${process.env.PACKAGE_REPOSITORY}/issues/new`} target="_blank" rel="noreferrer">
					Send Feedback
				</a>
			</span>
		</div>
	)
}
