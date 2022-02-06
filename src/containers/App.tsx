import React from 'react'
import { hot } from 'react-hot-loader'
import { connect } from 'react-redux'
import { Route, Switch, withRouter } from 'react-router'
import ErrorBoundary from '../components/ErrorBoundary'
import Footer from '../components/Footer'
import Home from '../components/Home'
import Navbar from '../components/Navbar'
import NotFound from '../components/NotFound'
import { BASE_URL } from '../constants'
import Notifications from '../containers/Notifications'
import { State } from '../types'
import Alerts from './Alerts'
import Auth from './Auth'
import TracksRoute from './TracksRoute'

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
						<Route exact path={BASE_URL} component={Home} />
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
