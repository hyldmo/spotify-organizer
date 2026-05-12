import { useRegisterSW } from 'virtual:pwa-register/react'
import type React from 'react'

const POLL_INTERVAL = 60_000

let pollHandle: ReturnType<typeof setInterval> | null = null

export const ReloadPrompt: React.FC = () => {
	const {
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker
	} = useRegisterSW({
		onRegisteredSW(_url, registration) {
			if (!registration) return
			if (pollHandle) clearInterval(pollHandle)
			pollHandle = setInterval(() => registration.update(), POLL_INTERVAL)
		}
	})

	if (!needRefresh) return null

	return (
		<div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-md bg-green-600 px-4 py-3 text-white shadow-lg">
			<span className="text-sm">New version available</span>
			<button onClick={() => setNeedRefresh(false)} className="rounded px-2 py-1 text-xs hover:bg-green-700">
				Dismiss
			</button>
			<button
				onClick={() => updateServiceWorker(true)}
				className="rounded bg-white px-3 py-1 text-xs font-medium text-green-700 hover:bg-gray-100"
			>
				Update
			</button>
		</div>
	)
}
