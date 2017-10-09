import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { Route, Switch } from 'react-router'

import Footer from '../components/Footer'
import Home from '../components/Home'
import Navbar from '../components/Navbar'
import NotFound from '../components/NotFound'
import { State } from '../reducers'
import TracksRoute from './TracksRoute'

import { BASE_URL } from '../constants'

const mapStateToProps = (state: State) => ({
	user: state.user,
	pathname: state.routing.location.pathname
})

const dispatchToProps = {
}

const stateProps = returntypeof(mapStateToProps)
type Props = typeof stateProps & typeof dispatchToProps

const App: React.StatelessComponent<Props> = (props) => (
	<div>
		<Navbar user={props.user}/>
		<main>
			<Switch>
				<Route exact path={BASE_URL} component={Home} />
				<Route exact path={`/playlists/:id`} component={TracksRoute} />
				<Route component={NotFound}/>
			</Switch>
		</main>
		<Footer />
	</div>
)

export default connect(
	mapStateToProps,
	dispatchToProps
)(App)
