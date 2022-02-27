import React from 'react'
import { useSelector } from 'react-redux'
import { Route, Routes } from 'react-router'
import 'static/app.svg'
import 'static/app.webmanifest'
import { __DEV__ } from '~/consts'
import PlaylistsManager from '~/pages/Home'
import NotFound from '~/pages/NotFound'
import PlaylistRoute from '~/pages/PlaylistRoute'
import { Skips } from '~/pages/Skips'
import { TrackRoute } from '~/pages/TrackRoute'
import '~/styles/main.scss'
import { State } from '~/types'
import Alerts from '../Alerts'
import { ErrorBoundary } from '../ErrorBoundary'
import Notifications from '../Notifications'
import Auth from './Auth'
import { Footer } from './Footer'
import { Header } from './Header'

if ('serviceWorker' in navigator && !__DEV__) {
	navigator.serviceWorker.register('/service-worker.js')
}

const App: React.FC = () => {
	const user = useSelector((s: State) => s.user)

	return (
		<>
			<Header user={user} />
			<Alerts />
			<main className="bg-inherit">
				<ErrorBoundary>
					{user ? (
						<Routes>
							<Route path="/" element={<PlaylistsManager />} />
							<Route path="/skips" element={<Skips />} />
							<Route path="/playlists/:id" element={<PlaylistRoute />} />
							<Route path="/tracks/:id" element={<TrackRoute />} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					) : (
						<Auth />
					)}
				</ErrorBoundary>
			</main>
			<Footer />
			<Notifications />
		</>
	)
}

export default App
