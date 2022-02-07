import cn from 'classnames'
import React from 'react'

type Props = {
	className?: string
	ms: number | null | undefined
}

export const Time: React.FC<Props> = ({ ms, className }) => (
	<div className={cn('text-xs text-gray-300 w-10', className)}>
		<span>{new Date(ms || 0).getMinutes()}</span>
		<span>:</span>
		<span>{new Date(ms || 0).getSeconds().toString().padStart(2, '0')}</span>
	</div>
)
