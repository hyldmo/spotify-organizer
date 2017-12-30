import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { Actions } from '../actions'

import { State } from '../reducers'

import '../styles/alerts.pcss'

const mapStateToProps = (state: State) => ({
	timer: state.timer
})

const dispatchToProps = {
	startTimer: Actions.startTimer
}

const stateProps = returntypeof(mapStateToProps)

type Props = typeof stateProps & typeof dispatchToProps

const Alerts: React.StatelessComponent<Props> = ({ timer, startTimer }) => (
	<ul className="alerts" onClick={() => startTimer(10)}>
		{timer > 0 && <li className="alert">
			Spotify API Limit Exceeded. Please wait {timer} seconds
		</li>}
	</ul>
)


export default connect(
	mapStateToProps,
	dispatchToProps
)(Alerts)
