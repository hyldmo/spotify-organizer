import * as React from 'react'
import { connect } from 'react-redux'
import { Route, Switch, withRouter } from 'react-router'
import ErrorBoundary from '../components/ErrorBoundary'
import Footer from '../components/Footer'
import Home from '../components/Home'
import Navbar from '../components/Navbar'
import NotFound from '../components/NotFound'
import { BASE_URL } from '../constants'
import { State } from '../reducers'
import Alerts from './Alerts'
import Auth from './Auth'
import TracksRoute from './TracksRoute'

const mapStateToProps = (state: State) => ({
	user: state.user
})

type Props = ReturnType<typeof mapStateToProps>

const App: React.StatelessComponent<Props> = ({ user }) => (
	<div>
		<Navbar user={user}/>
		<Alerts />
		<main>
			<ErrorBoundary>
				{user ? (
					<Switch>
						<Route exact path={BASE_URL} component={Home} />
						<Route exact path={`${BASE_URL}users/:user/playlists/:id`} component={TracksRoute} />
						<Route component={NotFound}/>
					</Switch>
				) : (
					<Auth />
				)}
			</ErrorBoundary>
		</main>
		<Footer />
	</div>
)

export default withRouter(connect(
	mapStateToProps,
	{}
)(App) as any)
