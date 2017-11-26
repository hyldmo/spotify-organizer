import * as React from 'react'
import { connect } from 'react-redux'
import { replace } from 'react-router-redux'

import { BASE_URL } from '../constants'
import { State } from '../reducers'


const mapStateToProps = (state: State) => ({})

const dispatchToProps = {
	replace
}

type Props = typeof dispatchToProps

class ErrorBoundary extends React.Component<Props> {
	state = {
		hasError: false
	}

	componentDidCatch (error: Error, info: React.ErrorInfo) {
		this.setState({ hasError: true })
	}

	render () {
		const { hasError } = this.state
		if (hasError) {
			if (location.pathname !== BASE_URL) {
				this.props.replace(BASE_URL)
			}
			return null
		}
		return this.props.children as any
	}
}


export default connect(
	mapStateToProps,
	dispatchToProps
)(ErrorBoundary)

