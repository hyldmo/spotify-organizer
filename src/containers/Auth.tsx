import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { replace } from 'react-router-redux'
import { Actions } from '../actions'
import { BASE_URL, loginLink } from '../constants'
import { State } from '../reducers'
import { parseQueryString } from '../utils/parseQueryString'

import '../styles/auth.pcss'

const mapStateToProps = (state: State) => ({
	user: state.user
})

const dispatchToProps = {
	tokenAquired: Actions.tokenAquired,
	replace
}

const stateProps = returntypeof(mapStateToProps)
type Props = typeof stateProps & typeof dispatchToProps

class Login extends React.Component<Props> {
	componentDidMount () {
		if (location.href.indexOf('#access_token=') !== -1) {
			const query = parseQueryString(location.href, true)
			this.props.tokenAquired(query.access_token, query.state)
		}
	}

	componentDidUpdate () {
		if (this.props.user)
			this.props.replace(BASE_URL)
	}

	render () {
		return (
			<div className="auth">
				<a className="button primary" href={loginLink()}>Log in to Spotify</a>
			</div>
		)
	}
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(Login)
