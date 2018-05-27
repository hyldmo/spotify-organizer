import * as React from 'react'
import { connect } from 'react-redux'
import { Actions } from '../actions'

import { State } from '../reducers'

const mapStateToProps = (state: State) => ({
	timer: state.timer
})

const dispatchToProps = {
	startTimer: Actions.startTimer
}

type Props = ReturnType<typeof mapStateToProps> & typeof dispatchToProps

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
