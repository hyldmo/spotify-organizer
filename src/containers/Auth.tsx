import * as React from 'react'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { Actions } from '../actions'
import { State } from '../reducers'

const mapStateToProps = (state: State) => ({
	version: state.version
})

const dispatchToProps = {
	login: Actions.login
}

const stateProps = returntypeof(mapStateToProps)
type Props = typeof stateProps & typeof dispatchToProps

class Login extends React.Component<Props> {
	componentDidMount () {
		this.props.login(getUrlParams(location.href).toString())
	}

	render () {
		return (
			<p>
				Version: {this.props.version}
			</p>
		)
	}
}


function getUrlParams (search) {
	const hashes = search.slice(search.indexOf('?') + 1).split('&')
	
	return hashes.map(hash => {
		const [key, val] = hash.split('=')
		return decodeURIComponent(val)
	})
}

export default connect(
	mapStateToProps,
	dispatchToProps
)(Login)
