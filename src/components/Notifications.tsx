import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cn from 'classnames'
import React from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { animated, config, useTransition } from 'react-spring'
import { Actions } from '~/actions'
import { Notification, State } from '~/types'

function getColor (type: Notification['type']): string {
	switch (type) {
		case 'success':
			return 'bg-green-600'
		case 'info':
			return 'bg-blue-600'
		case 'warning':
			return 'bg-yellow-500'
		case 'error':
			return 'bg-red-600'
	}
}

const Notifications: React.FC = () => {
	const dispatch = useDispatch()
	const notifications = useSelector((s: State) => s.notifications)

	const [transitions, api] = useTransition(notifications, () => ({
		from: { opacity: 1 },
		enter: { opacity: 1 },
		leave: { opacity: 0 },
		config: {
			...config.molasses,
			precision: 0.02,
			restVelocity: 0.05
		}
	}))

	return createPortal(
		<div className="absolute bottom-40 left-2/4 -translate-x-2/4 bg-transparent flex flex-col space-y-4 ">
			{transitions((styles, notification) => (
				<animated.div
					className={cn('px-20 py-2 rounded-lg space-x-2', getColor(notification.type))}
					style={styles}
				>
					{notification.progress ? (
						<>
							<FontAwesomeIcon icon="spinner" pulse />
							<span>{notification.message}...</span>
						</>
					) : (
						<>
							<span>{notification.message}</span>
							<FontAwesomeIcon
								icon="times"
								className="opacity-70 hover:opacity-100 cursor-pointer"
								onClick={_ => {
									api.set({ opacity: 0 })
									dispatch(Actions.clearNotification(notification.id))
								}}
							/>
						</>
					)}
				</animated.div>
			))}
		</div>,
		document.body
	)
}

export default Notifications
