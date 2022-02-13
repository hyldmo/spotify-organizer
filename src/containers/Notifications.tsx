import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { createPortal } from 'react-dom'
import { useSelector } from 'react-redux'
import { State } from '../types'
import cn from 'classnames'
import { animated, config, useTransition } from 'react-spring'

const Notifications: React.FC = () => {
	const notifications = useSelector((s: State) => s.notifications)

	const transitions = useTransition(notifications, {
		from: { opacity: 1 },
		enter: { opacity: 1 },
		leave: { opacity: 0 },
		delay: 200,
		config: {
			...config.molasses,
			precision: 0.02,
			restVelocity: 0.05
		}
	})

	return createPortal(
		<div className="absolute bottom-32 left-2/4 -translate-x-2/4 bg-transparent flex flex-col space-y-4 pointer-events-none">
			{transitions((styles, notification) => (
				<animated.div
					className={cn('px-20 py-2 rounded-lg bg-green-600', {
						'pointer-events-auto': styles.opacity.isAnimating
					})}
					style={styles}
				>
					{notification.progress ? (
						<span>
							<FontAwesomeIcon icon="spinner" pulse />
							&nbsp;&nbsp;{notification.message}...
						</span>
					) : (
						notification.message
					)}
				</animated.div>
			))}
		</div>,
		document.body
	)
}

export default Notifications
