import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { Actions } from '../actions'
import { State } from '../reducers'

import { replace } from 'react-router-redux'

const mapStateToProps = (state: State) => ({
	user: state.user
})

const dispatchToProps = {
	tokenAquired: Actions.tokenAquired
}

const stateProps = returntypeof(mapStateToProps)
type Props = typeof stateProps & typeof dispatchToProps

class Login extends React.Component<Props> {
	componentDidMount () {
		this.props.tokenAquired(getUrlParams(location.href).toString())
		replace('/')
	}

	render () {
		return null
	}
}


function getUrlParams (search) {
	const hashes = search.slice(search.indexOf('?') + 1).split('&')

	return hashes.map(hash => {
		const [_, val] = hash.split('=')
		return decodeURIComponent(val)
	})
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(Login)
