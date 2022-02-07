import React from 'react'
import { useSelector } from 'react-redux'
import { Route, Routes } from 'react-router'
import ErrorBoundary from '../components/ErrorBoundary'
import { Footer } from '../components/Footer'
import PlaylistsManager from '../pages/PlaylistsManager'
import Navbar from '../components/Navbar'
import NotFound from '../pages/NotFound'
import Notifications from '../containers/Notifications'
import { State } from '../types'
import Alerts from './Alerts'
import Auth from './Auth'
import TracksRoute from '../pages/TracksRoute'
import { Skips } from '../pages/Skips'

import '../styles/main.scss'

const App: React.FC = () => {
	const user = useSelector((s: State) => s.user)

	return (
		<>
			<Navbar user={user} />
			<Alerts />
			<main className="bg-inherit">
				<ErrorBoundary>
					{user ? (
						<Routes>
							<Route path="/" element={<PlaylistsManager />} />
							<Route path="/skips" element={<Skips />} />
							<Route path="/users/:user/playlists/:id" element={<TracksRoute />} />
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
