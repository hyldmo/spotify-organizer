import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { createPortal } from 'react-dom'
import { useSelector } from 'react-redux'
import { State } from '../types'

const Notifications: React.FC = () => {
	const notification = useSelector((s: State) => s.notifications)

	if (!notification) return null
	return createPortal(
		<div className="absolute bottom-20 left-2/4 -translate-x-2/4 px-20 py-2 rounded-lg bg-green-600">
			{notification.progress ? (
				<span>
					<FontAwesomeIcon icon="spinner" pulse />
					&nbsp;&nbsp;{notification.message}...
				</span>
			) : (
				notification.message
			)}
		</div>,
		document.body
	)
}

export default Notifications
