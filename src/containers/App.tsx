import React from 'react'
import { useSelector } from 'react-redux'
import { Route, Routes } from 'react-router'
import ErrorBoundary from '../components/ErrorBoundary'
import { Footer } from '../components/Footer'
import PlaylistsManager from '../pages/Home'
import { Header } from '../components/Header'
import NotFound from '../pages/NotFound'
import Notifications from '../containers/Notifications'
import { State } from '../types'
import Alerts from './Alerts'
import Auth from './Auth'
import TracksRoute from '../pages/PlaylistRoute'
import { Skips } from '../pages/Skips'
import { __DEV__ } from '../constants'

import '../styles/main.scss'
import '../../static/app.svg'
import '../../static/app.webmanifest'

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
							<Route path="/playlists/:id" element={<TracksRoute />} />
							<Route element={NotFound} />
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
