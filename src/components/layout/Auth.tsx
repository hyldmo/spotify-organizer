import { type FC, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { replace } from 'redux-first-history'
import { Actions } from '~/actions'
import type { State } from '~/types'
import { loginLink } from '~/utils/spotifyAuth'

type Status = 'idle' | 'pending' | 'failed'

// Browsers don't fire an event when an in-tab navigation actually commits, so
// we use a wall-clock guard: if `window.location` is assigned but the page
// doesn't navigate within this window, surface a retry. Covers Safari PWA
// energy-reload zombie tabs, blocked `sessionStorage`, popup blockers on the
// OAuth host, and other silent failure modes that previously left the user
// staring at a dead button.
const REDIRECT_TIMEOUT_MS = 3000

const Auth: FC = () => {
	const user = useSelector((s: State) => s.user)
	const dispatch = useDispatch()
	const [status, setStatus] = useState<Status>('idle')
	const timeoutRef = useRef<number | null>(null)

	useEffect(() => {
		if (user) dispatch(replace('/'))
	}, [user, dispatch])

	useEffect(
		() => () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		},
		[]
	)

	const handleLogin = async (e: React.MouseEvent) => {
		e.preventDefault()
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		setStatus('pending')
		timeoutRef.current = window.setTimeout(() => {
			timeoutRef.current = null
			setStatus('failed')
			dispatch(
				Actions.createNotification({
					message: "Spotify didn't open — your browser may have blocked the redirect",
					type: 'warning'
				})
			)
		}, REDIRECT_TIMEOUT_MS)

		try {
			window.location.href = await loginLink()
		} catch (err) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}
			setStatus('failed')
			dispatch(
				Actions.createNotification({
					message: `Login didn't start: ${(err as Error).message}`,
					type: 'warning'
				})
			)
		}
	}

	const label =
		status === 'pending'
			? 'Connecting to Spotify…'
			: status === 'failed'
				? "Couldn't reach Spotify · Retry"
				: 'Log in to Spotify'

	const variant = status === 'pending' ? 'pending' : status === 'failed' ? 'failed' : 'primary'

	return (
		<div className="auth">
			<a
				className={`button ${variant}`}
				href="#"
				onClick={handleLogin}
				aria-busy={status === 'pending'}
				aria-live="polite"
			>
				{status === 'pending' && <i className="fa fa-spinner fa-spin mr-2" />}
				{label}
			</a>
		</div>
	)
}

export default Auth
