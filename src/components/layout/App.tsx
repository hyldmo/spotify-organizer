import type React from 'react'
import { useSelector } from 'react-redux'
import { Route, Routes } from 'react-router'
import { Dashboard } from '~/pages/Dashboard'
import PlaylistsManager from '~/pages/Home'
import NotFound from '~/pages/NotFound'
import PlaylistRoute from '~/pages/PlaylistRoute'
import { Search } from '~/pages/Search'
import { Skips } from '~/pages/Skips'
import { TrackRoute } from '~/pages/TrackRoute'
import '~/styles/main.scss'
import type { State } from '~/types'
import Alerts from '../Alerts'
import { SilentErrorBoundary } from '../ErrorBoundary'
import Loading from '../Loading'
import Notifications from '../Notifications'
import { ReloadPrompt } from '../ReloadPrompt'
import Auth from './Auth'
import { Footer } from './Footer'
import { Header } from './Header'

const App: React.FC = () => {
	const user = useSelector((s: State) => s.user)
	const authChecking = useSelector((s: State) => s.auth.checking)

	return (
		<>
			<Header user={user} />
			<Alerts />
			<main className="bg-inherit">
				<SilentErrorBoundary>
					{user ? (
						<Routes>
							<Route path="/" element={<PlaylistsManager />} />
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/search" element={<Search />} />
							<Route path="/skips" element={<Skips />} />
							<Route path="/playlists/:id" element={<PlaylistRoute />} />
							<Route path="/tracks/:id" element={<TrackRoute />} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					) : authChecking ? (
						<Loading>
							<span className="mt-2 text-gray-300">Authenticating with Spotify…</span>
						</Loading>
					) : (
						<Auth />
					)}
				</SilentErrorBoundary>
			</main>
			<Footer />
			<Notifications />
			<ReloadPrompt />
		</>
	)
}

export default App
