import React from 'react'
import { hot } from 'react-hot-loader'
import { connect } from 'react-redux'
import { Route, Switch, withRouter } from 'react-router'
import ErrorBoundary from '../components/ErrorBoundary'
import { Footer } from '../components/Footer'
import PlaylistsManager from '../pages/PlaylistsManager'
import Navbar from '../components/Navbar'
import NotFound from '../pages/NotFound'
import { BASE_URL } from '../constants'
import Notifications from '../containers/Notifications'
import { State } from '../types'
import Alerts from './Alerts'
import Auth from './Auth'
import TracksRoute from '../pages/TracksRoute'

import '../styles/main.scss'

const mapStateToProps = (state: State) => ({
	user: state.user
})

type Props = ReturnType<typeof mapStateToProps>

const App: React.FC<Props> = ({ user }) => (
	<>
		<Navbar user={user} />
		<Alerts />
		<main className="bg-inherit">
			<ErrorBoundary>
				{user ? (
					<Switch>
						<Route exact path={BASE_URL} component={PlaylistsManager} />
						<Route exact path={`${BASE_URL}users/:user/playlists/:id`} component={TracksRoute} />
						<Route component={NotFound} />
					</Switch>
				) : (
					<Auth />
				)}
			</ErrorBoundary>
		</main>
		<Footer />
		<Notifications />
	</>
)

export default hot(module)(withRouter(connect(mapStateToProps, {})(App) as any))
