import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { SkipStats as Stats } from '~/types'

type Props = Stats & {
	onRemoveClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const SkipStats: React.FC<Props> = ({ skips = 0, plays = 0, onRemoveClick }) => {
	plays = Math.max(skips, plays) // Adjust up plays as they can sometime be missed
	return (
		<>
			<span className="opacity-70 align-right">{skips}</span>
			<span className="opacity-70 text-xs">skips</span>
			<span className="opacity-70 ">/</span>
			<span className="opacity-70 align-right">{Math.min(plays)}</span>
			<span className="opacity-70 text-xs">plays</span>
			<span className="opacity-40 text-sm">({Math.round((skips / plays) * 100)}%)</span>
			<button className="opacity-40 hover:opacity-80 mr-3" onClick={onRemoveClick}>
				{skips > 0 && (
					<FontAwesomeIcon className="align-middle" icon="times" size="xs" title="Reset skip count" />
				)}
			</button>
		</>
	)
}
