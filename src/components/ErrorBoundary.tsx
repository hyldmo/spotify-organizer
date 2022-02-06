import { replace } from 'connected-react-router'
import React from 'react'
import { connect } from 'react-redux'

import { BASE_URL } from '../constants'
import { State } from '../reducers'

const mapStateToProps = (_: State) => ({})

const dispatchToProps = {
	replace
}

type Props = typeof dispatchToProps

class ErrorBoundary extends React.Component<Props> {
	state = {
		hasError: false
	}

	static getDerivedStateFromError() {
		// Update state so the next render will show the fallback UI.
		return { hasError: true }
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		console.error(error, info)
	}

	render() {
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

export default connect(mapStateToProps, dispatchToProps)(ErrorBoundary)
