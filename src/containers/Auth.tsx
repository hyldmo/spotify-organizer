import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { Actions } from '../actions'
import { BASE_URL, loginLink } from '../constants'
import { State } from '../reducers'

import { replace } from 'react-router-redux'

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
			this.props.tokenAquired(getToken(location.href))
		}
	}

	componentDidUpdate () {
		if (this.props.user)
			this.props.replace(BASE_URL)
	}

	render () {
		return <a href={loginLink}>LOGIN</a>
	}
}


function getToken (url: string) {
	const search = '#access_token='
	const start = url.indexOf(search) + search.length
	const end = url.indexOf('&')
	return url.slice(start, end)
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(Login)
